import { openDB, type IDBPDatabase } from "idb";
import { nanoid } from "nanoid";
import type { Conversation, Message } from "../../types/chat";
import type {
	Project,
	ProjectSettings,
	ProjectSummary,
} from "../../types/project";
import type { GeneratedPrompt } from "../../types/prompt";
import type { Specification } from "../../types/specification";

interface DBSchema {
	projects: {
		key: string;
		value: {
			id: string;
			name: string;
			description?: string;
			created_at: string;
			updated_at: string;
			settings: string;
		};
		indexes: { 'by-updated': string };
	};
	conversations: {
		key: string;
		value: {
			id: string;
			project_id: string;
			created_at: string;
			updated_at: string;
		};
		indexes: { 'by-project': string };
	};
	messages: {
		key: string;
		value: {
			id: string;
			conversation_id: string;
			role: string;
			content: string;
			timestamp: string;
			is_error: boolean;
		};
		indexes: { 'by-conversation': string };
	};
	specifications: {
		key: string;
		value: {
			id: string;
			project_id: string;
			conversation_id: string;
			title: string;
			description: string;
			features: string;
			technical_requirements: string;
			constraints: string;
			ui_requirements: string;
			tech_stack: string;
			created_at: string;
			updated_at: string;
		};
		indexes: { 'by-project': string };
	};
	generated_prompts: {
		key: string;
		value: {
			id: string;
			project_id: string;
			specification_id: string;
			content: string;
			created_at: string;
			target_platform?: string;
			generated_with_llm?: boolean;
		};
		indexes: { 'by-project': string };
	};
}

class DatabaseService {
	private db: IDBPDatabase<DBSchema> | null = null;

	async initialize() {
		if (!this.db) {
			this.db = await openDB<DBSchema>("metaprompter", 2, {
				upgrade(db, oldVersion) {
					if (oldVersion < 1) {
						// Create projects store
						const projectStore = db.createObjectStore("projects", { keyPath: "id" });
						projectStore.createIndex("by-updated", "updated_at");

						// Create conversations store
						const conversationStore = db.createObjectStore("conversations", { keyPath: "id" });
						conversationStore.createIndex("by-project", "project_id");

						// Create messages store
						const messageStore = db.createObjectStore("messages", { keyPath: "id" });
						messageStore.createIndex("by-conversation", "conversation_id");

						// Create specifications store
						const specStore = db.createObjectStore("specifications", { keyPath: "id" });
						specStore.createIndex("by-project", "project_id");

						// Create generated_prompts store
						const promptStore = db.createObjectStore("generated_prompts", { keyPath: "id" });
						promptStore.createIndex("by-project", "project_id");
					}
					
					if (oldVersion < 2) {
						// Migration for tech_stack field - handled automatically by put operations
						// since we're adding a new field with default value
					}
				},
			});
		}
		return this.db;
	}

	private async getDb() {
		if (!this.db) {
			await this.initialize();
		}
		return this.db!;
	}

	// Project operations
	async createProject(name: string, description?: string): Promise<string> {
		const db = await this.getDb();
		const projectId = nanoid();
		const conversationId = nanoid();
		const now = new Date().toISOString();

		const defaultSettings: ProjectSettings = {
			aiProvider: "openai",
			maxTokens: 4000,
			maxConversationLength: 50,
		};

		const tx = db.transaction(["projects", "conversations"], "readwrite");
		
		await tx.objectStore("projects").add({
			id: projectId,
			name,
			description,
			created_at: now,
			updated_at: now,
			settings: JSON.stringify(defaultSettings),
		});

		await tx.objectStore("conversations").add({
			id: conversationId,
			project_id: projectId,
			created_at: now,
			updated_at: now,
		});

		await tx.done;
		return projectId;
	}

	async getProject(id: string): Promise<Project | null> {
		const db = await this.getDb();
		
		const projectRow = await db.get("projects", id);
		if (!projectRow) return null;

		const conversationRow = await db.getFromIndex("conversations", "by-project", id);
		if (!conversationRow) return null;

		const messageRows = await db.getAllFromIndex("messages", "by-conversation", conversationRow.id);
		const messages: Message[] = messageRows
			.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
			.map((row) => ({
				id: row.id,
				role: row.role,
				content: row.content,
				timestamp: new Date(row.timestamp),
				isError: row.is_error || false,
			}));

		const conversation: Conversation = {
			id: conversationRow.id,
			messages,
			createdAt: new Date(conversationRow.created_at),
			updatedAt: new Date(conversationRow.updated_at),
		};

		const specRow = await db.getFromIndex("specifications", "by-project", id);
		let specification: Specification | null = null;
		if (specRow) {
			specification = {
				id: specRow.id,
				title: specRow.title,
				description: specRow.description,
				features: JSON.parse(specRow.features),
				technicalRequirements: JSON.parse(specRow.technical_requirements),
				constraints: JSON.parse(specRow.constraints),
				uiRequirements: JSON.parse(specRow.ui_requirements),
				techStack: specRow.tech_stack ? JSON.parse(specRow.tech_stack) : [],
				createdAt: new Date(specRow.created_at),
				updatedAt: new Date(specRow.updated_at),
				conversationId: specRow.conversation_id,
			};
		}

		const promptRows = await db.getAllFromIndex("generated_prompts", "by-project", id);
		const generatedPrompts: GeneratedPrompt[] = promptRows
			.sort((a, b) => b.created_at.localeCompare(a.created_at))
			.map((row) => ({
				id: row.id,
				content: row.content,
				createdAt: new Date(row.created_at),
				specificationId: row.specification_id,
				targetPlatform: row.target_platform as "lovable" | "v0" | "replit" | "general" | undefined,
				generatedWithLLM: row.generated_with_llm,
			}));

		return {
			id: projectRow.id,
			name: projectRow.name,
			description: projectRow.description || undefined,
			createdAt: new Date(projectRow.created_at),
			updatedAt: new Date(projectRow.updated_at),
			conversation,
			specification,
			generatedPrompts,
			settings: JSON.parse(projectRow.settings),
		};
	}

	async getProjectSummaries(): Promise<ProjectSummary[]> {
		const db = await this.getDb();
		
		const projects = await db.getAllFromIndex("projects", "by-updated");
		const summaries: ProjectSummary[] = [];

		for (const project of projects) {
			const conversation = await db.getFromIndex("conversations", "by-project", project.id);
			const messageCount = conversation 
				? (await db.getAllFromIndex("messages", "by-conversation", conversation.id)).length 
				: 0;

			const specification = await db.getFromIndex("specifications", "by-project", project.id);
			let featureCount = 0;
			if (specification != null && specification.features) {
				try {
					const features = JSON.parse(specification.features);
					featureCount = Array.isArray(features) ? features.length : 0;
				} catch (error) {
					// If JSON parsing fails, treat as no features
					featureCount = 0;
				}
			}

			summaries.push({
				id: project.id,
				name: project.name,
				description: project.description || undefined,
				createdAt: new Date(project.created_at),
				updatedAt: new Date(project.updated_at),
				messageCount,
				featureCount,
			});
		}

		return summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	}

	async updateProject(
		id: string,
		updates: Partial<Pick<Project, "name" | "description" | "settings">>,
	): Promise<void> {
		const db = await this.getDb();
		
		const project = await db.get("projects", id);
		if (!project) return;

		const updatedProject = { ...project };
		
		if (updates.name !== undefined) {
			updatedProject.name = updates.name;
		}

		if (updates.description !== undefined) {
			updatedProject.description = updates.description;
		}

		if (updates.settings !== undefined) {
			updatedProject.settings = JSON.stringify(updates.settings);
		}

		updatedProject.updated_at = new Date().toISOString();

		await db.put("projects", updatedProject);
	}

	async deleteProject(id: string): Promise<void> {
		const db = await this.getDb();
		
		const tx = db.transaction(["projects", "conversations", "messages", "specifications", "generated_prompts"], "readwrite");
		
		// Delete project
		await tx.objectStore("projects").delete(id);
		
		// Delete conversations and related data
		const conversations = await tx.objectStore("conversations").index("by-project").getAll(id);
		for (const conversation of conversations) {
			await tx.objectStore("conversations").delete(conversation.id);
			
			// Delete messages
			const messages = await tx.objectStore("messages").index("by-conversation").getAll(conversation.id);
			for (const message of messages) {
				await tx.objectStore("messages").delete(message.id);
			}
		}
		
		// Delete specifications
		const specifications = await tx.objectStore("specifications").index("by-project").getAll(id);
		for (const spec of specifications) {
			await tx.objectStore("specifications").delete(spec.id);
		}
		
		// Delete generated prompts
		const prompts = await tx.objectStore("generated_prompts").index("by-project").getAll(id);
		for (const prompt of prompts) {
			await tx.objectStore("generated_prompts").delete(prompt.id);
		}
		
		await tx.done;
	}

	// Message operations
	async addMessage(
		conversationId: string,
		message: Omit<Message, "id" | "timestamp">,
	): Promise<string> {
		const db = await this.getDb();
		const messageId = nanoid();
		const now = new Date().toISOString();

		const tx = db.transaction(["messages", "conversations", "projects"], "readwrite");
		
		// Add message
		await tx.objectStore("messages").add({
			id: messageId,
			conversation_id: conversationId,
			role: message.role,
			content: message.content,
			timestamp: now,
			is_error: message.isError || false,
		});

		// Update conversation timestamp
		const conversation = await tx.objectStore("conversations").get(conversationId);
		if (conversation) {
			await tx.objectStore("conversations").put({
				...conversation,
				updated_at: now,
			});

			// Update project timestamp
			const project = await tx.objectStore("projects").get(conversation.project_id);
			if (project) {
				await tx.objectStore("projects").put({
					...project,
					updated_at: now,
				});
			}
		}

		await tx.done;
		return messageId;
	}

	async updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
		const db = await this.getDb();
		
		const message = await db.get("messages", messageId);
		if (!message) return;

		const updatedMessage = { ...message };
		
		if (updates.content !== undefined) {
			updatedMessage.content = updates.content;
		}

		if (updates.isError !== undefined) {
			updatedMessage.is_error = updates.isError;
		}

		await db.put("messages", updatedMessage);
	}

	async clearMessages(conversationId: string): Promise<void> {
		const db = await this.getDb();
		
		const tx = db.transaction(["messages", "conversations"], "readwrite");
		
		// Delete all messages for this conversation
		const messages = await tx.objectStore("messages").index("by-conversation").getAll(conversationId);
		for (const message of messages) {
			await tx.objectStore("messages").delete(message.id);
		}

		// Update conversation timestamp
		const conversation = await tx.objectStore("conversations").get(conversationId);
		if (conversation) {
			await tx.objectStore("conversations").put({
				...conversation,
				updated_at: new Date().toISOString(),
			});
		}

		await tx.done;
	}

	// Specification operations
	async saveSpecification(
		projectId: string,
		conversationId: string,
		specification: Specification,
	): Promise<void> {
		const db = await this.getDb();
		const now = new Date().toISOString();

		const tx = db.transaction(["specifications", "projects"], "readwrite");
		
		await tx.objectStore("specifications").put({
			id: specification.id,
			project_id: projectId,
			conversation_id: conversationId,
			title: specification.title,
			description: specification.description,
			features: JSON.stringify(specification.features),
			technical_requirements: JSON.stringify(specification.technicalRequirements),
			constraints: JSON.stringify(specification.constraints),
			ui_requirements: JSON.stringify(specification.uiRequirements),
			tech_stack: JSON.stringify(specification.techStack || []),
			created_at: specification.createdAt.toISOString(),
			updated_at: now,
		});

		// Update project timestamp
		const project = await tx.objectStore("projects").get(projectId);
		if (project) {
			await tx.objectStore("projects").put({
				...project,
				updated_at: now,
			});
		}

		await tx.done;
	}

	async deleteSpecification(projectId: string, specificationId: string): Promise<void> {
		const db = await this.getDb();
		
		const specification = await db.get("specifications", specificationId);
		if (specification && specification.project_id === projectId) {
			await db.delete("specifications", specificationId);
		}
	}

	// Generated prompt operations
	async saveGeneratedPrompt(projectId: string, prompt: GeneratedPrompt): Promise<void> {
		const db = await this.getDb();
		const now = new Date().toISOString();

		const tx = db.transaction(["generated_prompts", "projects"], "readwrite");
		
		await tx.objectStore("generated_prompts").put({
			id: prompt.id,
			project_id: projectId,
			specification_id: prompt.specificationId,
			content: prompt.content,
			created_at: prompt.createdAt.toISOString(),
			target_platform: prompt.targetPlatform,
			generated_with_llm: prompt.generatedWithLLM,
		});

		// Update project timestamp
		const project = await tx.objectStore("projects").get(projectId);
		if (project) {
			await tx.objectStore("projects").put({
				...project,
				updated_at: now,
			});
		}

		await tx.done;
	}

	async deleteGeneratedPrompt(projectId: string, promptId: string): Promise<void> {
		const db = await this.getDb();
		
		const prompt = await db.get("generated_prompts", promptId);
		if (prompt && prompt.project_id === projectId) {
			await db.delete("generated_prompts", promptId);
		}
	}

	async close(): Promise<void> {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}
}

export const database = new DatabaseService();
