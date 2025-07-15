import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIProvider } from "../lib/ai/chat-service";

interface SettingsState {
	// AI Settings
	aiProvider: AIProvider;
	openaiApiKey: string;
	geminiApiKey: string;

	// Application Settings
	maxTokens: number;
	maxConversationLength: number;

	// Actions
	setAiProvider: (provider: AIProvider) => void;
	setOpenaiApiKey: (key: string) => void;
	setGeminiApiKey: (key: string) => void;
	setMaxTokens: (tokens: number) => void;
	setMaxConversationLength: (length: number) => void;

	// Getters
	getActiveApiKey: () => string;
	hasValidApiKey: () => boolean;
	isProviderConfigured: (provider: AIProvider) => boolean;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set, get) => ({
			// Default settings
			aiProvider: "openai",
			openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
			geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
			maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || "4000"),
			maxConversationLength: parseInt(
				import.meta.env.VITE_MAX_CONVERSATION_LENGTH || "50",
			),

			// Actions
			setAiProvider: (provider: AIProvider) => {
				set({ aiProvider: provider });
			},

			setOpenaiApiKey: (key: string) => {
				set({ openaiApiKey: key });
			},

			setGeminiApiKey: (key: string) => {
				set({ geminiApiKey: key });
			},

			setMaxTokens: (tokens: number) => {
				set({ maxTokens: tokens });
			},

			setMaxConversationLength: (length: number) => {
				set({ maxConversationLength: length });
			},

			// Getters
			getActiveApiKey: () => {
				const { aiProvider, openaiApiKey, geminiApiKey } = get();
				return aiProvider === "openai" ? openaiApiKey : geminiApiKey;
			},

			hasValidApiKey: () => {
				const { aiProvider, openaiApiKey, geminiApiKey } = get();
				return aiProvider === "openai" ? !!openaiApiKey : !!geminiApiKey;
			},

			isProviderConfigured: (provider: AIProvider) => {
				const { openaiApiKey, geminiApiKey } = get();
				return provider === "openai" ? !!openaiApiKey : !!geminiApiKey;
			},
		}),
		{
			name: "settings-storage",
		},
	),
);
