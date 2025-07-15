import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message } from "../types/chat";

interface ChatState {
	conversations: Conversation[];
	activeConversationId: string | null;
	isLoading: boolean;

	// Actions
	createConversation: () => string;
	setActiveConversation: (id: string) => void;
	addMessage: (
		conversationId: string,
		message: Omit<Message, "id" | "timestamp">,
	) => void;
	updateMessage: (
		conversationId: string,
		messageId: string,
		updates: Partial<Message>,
	) => void;
	clearConversation: (conversationId: string) => void;
	deleteConversation: (conversationId: string) => void;
	clearAllConversations: () => void;
	setLoading: (loading: boolean) => void;

	// Getters
	getActiveConversation: () => Conversation | null;
	getMessages: (conversationId: string) => Message[];
}

const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatState>()(
	persist(
		(set, get) => ({
			conversations: [],
			activeConversationId: null,
			isLoading: false,

			createConversation: () => {
				const id = generateId();
				const newConversation: Conversation = {
					id,
					messages: [],
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				set((state) => ({
					conversations: [...state.conversations, newConversation],
					activeConversationId: id,
				}));

				return id;
			},

			setActiveConversation: (id: string) => {
				set({ activeConversationId: id });
			},

			addMessage: (
				conversationId: string,
				message: Omit<Message, "id" | "timestamp">,
			) => {
				const newMessage: Message = {
					id: generateId(),
					timestamp: new Date(),
					...message,
				};

				set((state) => ({
					conversations: state.conversations.map((conv) =>
						conv.id === conversationId
							? {
									...conv,
									messages: [...conv.messages, newMessage],
									updatedAt: new Date(),
								}
							: conv,
					),
				}));
			},

			updateMessage: (
				conversationId: string,
				messageId: string,
				updates: Partial<Message>,
			) => {
				set((state) => ({
					conversations: state.conversations.map((conv) =>
						conv.id === conversationId
							? {
									...conv,
									messages: conv.messages.map((msg) =>
										msg.id === messageId ? { ...msg, ...updates } : msg,
									),
									updatedAt: new Date(),
								}
							: conv,
					),
				}));
			},

			clearConversation: (conversationId: string) => {
				set((state) => ({
					conversations: state.conversations.map((conv) =>
						conv.id === conversationId
							? { ...conv, messages: [], updatedAt: new Date() }
							: conv,
					),
				}));
			},

			deleteConversation: (conversationId: string) => {
				set((state) => ({
					conversations: state.conversations.filter(
						(conv) => conv.id !== conversationId,
					),
					activeConversationId:
						state.activeConversationId === conversationId
							? null
							: state.activeConversationId,
				}));
			},

			clearAllConversations: () => {
				set({
					conversations: [],
					activeConversationId: null,
					isLoading: false,
				});
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},

			getActiveConversation: () => {
				const { conversations, activeConversationId } = get();
				return (
					conversations.find((conv) => conv.id === activeConversationId) || null
				);
			},

			getMessages: (conversationId: string) => {
				const { conversations } = get();
				const conversation = conversations.find(
					(conv) => conv.id === conversationId,
				);
				return conversation?.messages || [];
			},
		}),
		{
			name: "chat-storage",
			partialize: (state) => ({
				conversations: state.conversations,
				activeConversationId: state.activeConversationId,
			}),
		},
	),
);
