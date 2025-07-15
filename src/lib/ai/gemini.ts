import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export class GeminiService {
	private model: any;

	constructor(apiKey: string) {
		const google = createGoogleGenerativeAI({
			apiKey,
		});
		this.model = google("gemini-2.5-flash");
	}

	async sendMessage(
		messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
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
			console.error("Gemini API error:", error);
			throw new Error("Failed to get response from Gemini");
		}
	}

	async sendMessageStream(
		messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
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
			console.error("Gemini streaming error:", error);
			throw new Error("Failed to get streaming response from Gemini");
		}
	}
}
