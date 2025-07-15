import { create } from "zustand";
import { database } from "../lib/database/database";
import type { Project, ProjectSummary } from "../types/project";
import type { Message } from "../types/chat";
import type { Specification } from "../types/specification";
import type { GeneratedPrompt } from "../types/prompt";

interface ProjectState {
	currentProject: Project | null;
	projectSummaries: ProjectSummary[];
	isLoading: boolean;

	// Actions
	createProject: (name: string, description?: string) => Promise<string>;
	loadProject: (id: string) => Promise<void>;
	loadProjectSummaries: () => Promise<void>;
	updateProject: (
		updates: Partial<Pick<Project, "name" | "description" | "settings">>,
	) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;

	// Message actions
	addMessage: (message: Omit<Message, "id" | "timestamp">) => Promise<string>;
	updateMessage: (
		messageId: string,
		updates: Partial<Message>,
	) => Promise<void>;
	clearMessages: () => Promise<void>;

	// Specification actions
	saveSpecification: (specification: Specification) => Promise<void>;
	deleteSpecification: (specificationId: string) => Promise<void>;

	// Generated prompt actions
	saveGeneratedPrompt: (prompt: GeneratedPrompt) => Promise<void>;
	deleteGeneratedPrompt: (promptId: string) => Promise<void>;

	// Utility actions
	setLoading: (loading: boolean) => void;
	clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
	currentProject: null,
	projectSummaries: [],
	isLoading: false,

	createProject: async (name: string, description?: string) => {
		set({ isLoading: true });
		try {
			const projectId = await database.createProject(name, description);
			const project = await database.getProject(projectId);

			if (project) {
				set({ currentProject: project });
				await get().loadProjectSummaries();
			}

			return projectId;
		} catch (error) {
			console.error("Failed to create project:", error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	loadProject: async (id: string) => {
		set({ isLoading: true });
		try {
			const project = await database.getProject(id);
			set({ currentProject: project });
		} catch (error) {
			console.error("Failed to load project:", error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	loadProjectSummaries: async () => {
		try {
			const summaries = await database.getProjectSummaries();
			set({ projectSummaries: summaries });
		} catch (error) {
			console.error("Failed to load project summaries:", error);
			throw error;
		}
	},

	updateProject: async (
		updates: Partial<Pick<Project, "name" | "description" | "settings">>,
	) => {
		const { currentProject } = get();
		if (!currentProject) return;

		try {
			await database.updateProject(currentProject.id, updates);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					...updates,
					updatedAt: new Date(),
				},
			});

			await get().loadProjectSummaries();
		} catch (error) {
			console.error("Failed to update project:", error);
			throw error;
		}
	},

	deleteProject: async (id: string) => {
		try {
			await database.deleteProject(id);

			const { currentProject } = get();
			if (currentProject?.id === id) {
				set({ currentProject: null });
			}

			await get().loadProjectSummaries();
		} catch (error) {
			console.error("Failed to delete project:", error);
			throw error;
		}
	},

	addMessage: async (message: Omit<Message, "id" | "timestamp">) => {
		const { currentProject } = get();
		if (!currentProject) throw new Error("No current project");

		try {
			const messageId = await database.addMessage(
				currentProject.conversation.id,
				message,
			);

			// Update local state
			const newMessage: Message = {
				id: messageId,
				timestamp: new Date(),
				...message,
			};

			set({
				currentProject: {
					...currentProject,
					conversation: {
						...currentProject.conversation,
						messages: [...currentProject.conversation.messages, newMessage],
						updatedAt: new Date(),
					},
					updatedAt: new Date(),
				},
			});

			return messageId;
		} catch (error) {
			console.error("Failed to add message:", error);
			throw error;
		}
	},

	updateMessage: async (messageId: string, updates: Partial<Message>) => {
		const { currentProject } = get();
		if (!currentProject) return;

		try {
			await database.updateMessage(messageId, updates);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					conversation: {
						...currentProject.conversation,
						messages: currentProject.conversation.messages.map((msg) =>
							msg.id === messageId ? { ...msg, ...updates } : msg,
						),
						updatedAt: new Date(),
					},
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to update message:", error);
			throw error;
		}
	},

	clearMessages: async () => {
		const { currentProject } = get();
		if (!currentProject) return;

		try {
			await database.clearMessages(currentProject.conversation.id);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					conversation: {
						...currentProject.conversation,
						messages: [],
						updatedAt: new Date(),
					},
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to clear messages:", error);
			throw error;
		}
	},

	saveSpecification: async (specification: Specification) => {
		const { currentProject } = get();
		if (!currentProject) throw new Error("No current project");

		try {
			await database.saveSpecification(
				currentProject.id,
				currentProject.conversation.id,
				specification,
			);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					specification,
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to save specification:", error);
			throw error;
		}
	},

	deleteSpecification: async (specificationId: string) => {
		const { currentProject } = get();
		if (!currentProject) return;

		try {
			await database.deleteSpecification(currentProject.id, specificationId);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					specification: null,
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to delete specification:", error);
			throw error;
		}
	},

	saveGeneratedPrompt: async (prompt: GeneratedPrompt) => {
		const { currentProject } = get();
		if (!currentProject) throw new Error("No current project");

		try {
			await database.saveGeneratedPrompt(currentProject.id, prompt);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					generatedPrompts: [prompt, ...currentProject.generatedPrompts],
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to save generated prompt:", error);
			throw error;
		}
	},

	deleteGeneratedPrompt: async (promptId: string) => {
		const { currentProject } = get();
		if (!currentProject) return;

		try {
			await database.deleteGeneratedPrompt(currentProject.id, promptId);

			// Update local state
			set({
				currentProject: {
					...currentProject,
					generatedPrompts: currentProject.generatedPrompts.filter(
						(p) => p.id !== promptId,
					),
					updatedAt: new Date(),
				},
			});
		} catch (error) {
			console.error("Failed to delete generated prompt:", error);
			throw error;
		}
	},

	setLoading: (loading: boolean) => {
		set({ isLoading: loading });
	},

	clearCurrentProject: () => {
		set({ currentProject: null });
	},
}));
