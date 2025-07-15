import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Specification } from "../types/specification";

interface SpecificationState {
	specifications: Specification[];
	activeSpecificationId: string | null;
	isUpdating: boolean;

	// Actions
	createSpecification: (conversationId: string) => string;
	updateSpecification: (id: string, updates: Partial<Specification>) => void;
	setActiveSpecification: (id: string) => void;
	deleteSpecification: (id: string) => void;
	clearAllSpecifications: () => void;
	setUpdating: (updating: boolean) => void;

	// Getters
	getActiveSpecification: () => Specification | null;
	getSpecificationByConversation: (
		conversationId: string,
	) => Specification | null;
}

const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptySpecification = (conversationId: string): Specification => ({
	id: generateId(),
	title: "",
	description: "",
	features: [],
	technicalRequirements: [],
	constraints: [],
	uiRequirements: [],
	techStack: [],
	createdAt: new Date(),
	updatedAt: new Date(),
	conversationId,
});

export const useSpecificationStore = create<SpecificationState>()(
	persist(
		(set, get) => ({
			specifications: [],
			activeSpecificationId: null,
			isUpdating: false,

			createSpecification: (conversationId: string) => {
				const newSpec = createEmptySpecification(conversationId);

				set((state) => ({
					specifications: [...state.specifications, newSpec],
					activeSpecificationId: newSpec.id,
				}));

				return newSpec.id;
			},

			updateSpecification: (id: string, updates: Partial<Specification>) => {
				set((state) => ({
					specifications: state.specifications.map((spec) =>
						spec.id === id
							? { ...spec, ...updates, updatedAt: new Date() }
							: spec,
					),
				}));
			},

			setActiveSpecification: (id: string) => {
				set({ activeSpecificationId: id });
			},

			deleteSpecification: (id: string) => {
				set((state) => ({
					specifications: state.specifications.filter((spec) => spec.id !== id),
					activeSpecificationId:
						state.activeSpecificationId === id
							? null
							: state.activeSpecificationId,
				}));
			},

			clearAllSpecifications: () => {
				set({
					specifications: [],
					activeSpecificationId: null,
					isUpdating: false,
				});
			},

			setUpdating: (updating: boolean) => {
				set({ isUpdating: updating });
			},

			getActiveSpecification: () => {
				const { specifications, activeSpecificationId } = get();
				return (
					specifications.find((spec) => spec.id === activeSpecificationId) ||
					null
				);
			},

			getSpecificationByConversation: (conversationId: string) => {
				const { specifications } = get();
				return (
					specifications.find(
						(spec) => spec.conversationId === conversationId,
					) || null
				);
			},
		}),
		{
			name: "specification-storage",
			partialize: (state) => ({
				specifications: state.specifications,
				activeSpecificationId: state.activeSpecificationId,
			}),
		},
	),
);
