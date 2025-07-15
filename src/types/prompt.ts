export interface PromptTemplate {
	id: string;
	name: string;
	template: string;
	variables: string[];
}

export interface GeneratedPrompt {
	id: string;
	content: string;
	createdAt: Date;
	specificationId: string;
	targetPlatform?: "lovable" | "v0" | "replit" | "general";
	generatedWithLLM?: boolean;
}
