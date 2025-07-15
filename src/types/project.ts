import type { Conversation } from "./chat";
import type { Specification } from "./specification";
import type { GeneratedPrompt } from "./prompt";

export interface Project {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;

	// Related data
	conversation: Conversation;
	specification: Specification | null;
	generatedPrompts: GeneratedPrompt[];

	// Settings specific to this project
	settings: ProjectSettings;
}

export interface ProjectSettings {
	aiProvider: "openai" | "gemini";
	maxTokens: number;
	maxConversationLength: number;
}

export interface ProjectSummary {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	messageCount: number;
	hasSpecification: boolean;
	hasGeneratedPrompts: boolean;
}
