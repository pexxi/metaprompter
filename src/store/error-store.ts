import { create } from "zustand";

export interface AppError {
	id: string;
	type: "chat" | "specification" | "prompt" | "settings" | "general";
	title: string;
	message: string;
	details?: string;
	timestamp: Date;
	dismissed: boolean;
	action?: {
		label: string;
		handler: () => void;
	};
}

interface ErrorState {
	errors: AppError[];

	// Actions
	addError: (error: Omit<AppError, "id" | "timestamp" | "dismissed">) => void;
	dismissError: (id: string) => void;
	clearAllErrors: () => void;

	// Getters
	getActiveErrors: () => AppError[];
	hasErrors: () => boolean;
}

const generateId = () =>
	`error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useErrorStore = create<ErrorState>((set, get) => ({
	errors: [],

	addError: (error) => {
		const newError: AppError = {
			id: generateId(),
			timestamp: new Date(),
			dismissed: false,
			...error,
		};

		set((state) => ({
			errors: [...state.errors, newError],
		}));
	},

	dismissError: (id: string) => {
		set((state) => ({
			errors: state.errors.map((error) =>
				error.id === id ? { ...error, dismissed: true } : error,
			),
		}));
	},

	clearAllErrors: () => {
		set({ errors: [] });
	},

	getActiveErrors: () => {
		return get().errors.filter((error) => !error.dismissed);
	},

	hasErrors: () => {
		return get().errors.some((error) => !error.dismissed);
	},
}));
