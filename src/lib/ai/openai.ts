import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export class OpenAIService {
	private model: any;

	constructor(apiKey: string) {
		const openai = createOpenAI({
			apiKey,
		});
		this.model = openai("gpt-4o-mini");
	}

	async sendMessage(
		messages: Array<{ role: "user" | "assistant"; content: string }>,
	) {
		try {
			const { text } = await generateText({
				model: this.model,
				messages: messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || "4000"),
				temperature: 0.7,
				maxRetries: 3,
			});

			return text;
		} catch (error) {
			console.error("OpenAI API error:", error);
			throw new Error("Failed to get response from OpenAI");
		}
	}

	async sendMessageStream(
		messages: Array<{ role: "user" | "assistant"; content: string }>,
		onChunk: (chunk: string) => void,
	) {
		try {
			const { textStream } = await streamText({
				model: this.model,
				messages: messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || "4000"),
				temperature: 0.7,
				maxRetries: 3,
			});

			let fullResponse = "";
			for await (const chunk of textStream) {
				if (chunk) {
					fullResponse += chunk;
					onChunk(chunk);
				}
			}

			return fullResponse;
		} catch (error) {
			console.error("OpenAI streaming error:", error);
			throw new Error("Failed to get streaming response from OpenAI");
		}
	}
}
