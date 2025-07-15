/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_OPENAI_API_KEY: string;
	readonly VITE_OPENAI_MODEL: string;
	readonly VITE_GEMINI_API_KEY: string;
	readonly VITE_GEMINI_MODEL: string;
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_VERSION: string;
	readonly VITE_MAX_TOKENS: string;
	readonly VITE_MAX_CONVERSATION_LENGTH: string;
}
