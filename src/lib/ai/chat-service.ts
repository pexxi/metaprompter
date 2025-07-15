import type { Message } from "../../types/chat";
import { GeminiService } from "./gemini";
import { OpenAIService } from "./openai";

export type AIProvider = "openai" | "gemini";

export interface AISettings {
	provider: AIProvider;
	openaiApiKey?: string;
	geminiApiKey?: string;
}

export class ChatService {
	private openaiService?: OpenAIService;
	private geminiService?: GeminiService;
	private currentProvider: AIProvider;

	constructor(settings: AISettings) {
		this.currentProvider = settings.provider;

		if (settings.openaiApiKey) {
			this.openaiService = new OpenAIService(settings.openaiApiKey);
		}

		if (settings.geminiApiKey) {
			this.geminiService = new GeminiService(settings.geminiApiKey);
		}
	}

	private getActiveService() {
		if (this.currentProvider === "openai" && this.openaiService) {
			return this.openaiService;
		}

		if (this.currentProvider === "gemini" && this.geminiService) {
			return this.geminiService;
		}

		throw new Error(`No API key configured for ${this.currentProvider}`);
	}

	private convertMessages(messages: Message[]) {
		return messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
		}));
	}

	async sendMessage(messages: Message[]): Promise<string> {
		const service = this.getActiveService();
		const convertedMessages = this.convertMessages(messages);
		return await service.sendMessage(convertedMessages);
	}

	async sendMessageStream(
		messages: Message[],
		onChunk: (chunk: string) => void,
	): Promise<string> {
		const service = this.getActiveService();
		const convertedMessages = this.convertMessages(messages);
		return await service.sendMessageStream(convertedMessages, onChunk);
	}

	switchProvider(provider: AIProvider) {
		this.currentProvider = provider;
	}

	getCurrentProvider(): AIProvider {
		return this.currentProvider;
	}

	isProviderAvailable(provider: AIProvider): boolean {
		return (
			(provider === "openai" && !!this.openaiService) ||
			(provider === "gemini" && !!this.geminiService)
		);
	}
}
