import { useCallback, useRef, useState } from "react";
import { ChatService } from "../lib/ai/chat-service";
import { generateContextualPrompt } from "../lib/prompts/system-prompts";
import { filterMessagesForLLM } from "../lib/utils/message-filter";
import { useProjectStore } from "../store/project-store";
import { useNotificationStore } from "../store/notification-store";
import { useSettingsStore } from "../store/settings-store";

export const useChat = () => {
	const { currentProject, addMessage, updateMessage, isLoading, setLoading } =
		useProjectStore();

	const { aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey } =
		useSettingsStore();

	const { error: showError, warning: showWarning } = useNotificationStore();
	const [error, setError] = useState<string | null>(null);
	const chatServiceRef = useRef<ChatService | null>(null);

	// Initialize chat service
	const getChatService = useCallback(() => {
		if (!hasValidApiKey()) {
			throw new Error("No API key configured");
		}

		if (!chatServiceRef.current) {
			chatServiceRef.current = new ChatService({
				provider: aiProvider,
				openaiApiKey,
				geminiApiKey,
			});
		}

		return chatServiceRef.current;
	}, [aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey]);

	// Reset chat service when provider changes
	const resetChatService = useCallback(() => {
		chatServiceRef.current = null;
	}, []);

	const sendMessage = useCallback(
		async (message: string) => {
			if (!currentProject) return;

			setLoading(true);
			setError(null);

			// Declare variables outside try block for error handling
			let currentMessageId = "";
			let fullResponse = "";

			try {
				const conversation = currentProject.conversation;
				if (!conversation) return;

				// Add user message first
				await addMessage({
					role: "user",
					content: message,
				});

				const chatService = getChatService();

				// Get updated project with the new message
				const updatedProject = useProjectStore.getState().currentProject;
				if (!updatedProject) return;

				// Filter messages to avoid role sequence errors
				const filteredMessages = filterMessagesForLLM(updatedProject.conversation.messages);

				// Prepare contextual messages without creating consecutive user messages
				let contextualMessages: typeof filteredMessages = [];

				if (filteredMessages.length === 0) {
					// No messages yet, send context as first user message
					contextualMessages = [
						{
							role: "user" as const,
							content: generateContextualPrompt([]),
							id: "context",
							timestamp: new Date(),
						},
					];
				} else {
					// Merge context with the conversation history instead of adding as separate message
					contextualMessages = [...filteredMessages];

					// Add context as a system-like instruction by prepending to the first user message
					const firstUserMessageIndex = contextualMessages.findIndex(
						(msg) => msg.role === "user",
					);
					if (firstUserMessageIndex >= 0) {
						const contextPrompt = generateContextualPrompt(filteredMessages);
						contextualMessages[firstUserMessageIndex] = {
							...contextualMessages[firstUserMessageIndex],
							content: `${contextPrompt}\n\nUser: ${contextualMessages[firstUserMessageIndex].content}`,
						};
					}
				}

				// Add a temporary message for streaming
				currentMessageId = await addMessage({
					role: "assistant",
					content: "",
				});

				const response = await chatService.sendMessageStream(
					contextualMessages,
					(chunk: string) => {
						fullResponse += chunk;
						if (currentMessageId) {
							updateMessage(currentMessageId, {
								content: fullResponse,
							});
						}
					},
				);

				// Final update with complete response
				if (currentMessageId) {
					updateMessage(currentMessageId, {
						content: response,
					});
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to get AI response";
				setError(errorMessage);
				console.error("Chat error:", err);

				// Mark any existing partial response as error
				if (currentMessageId) {
					updateMessage(currentMessageId, {
						content:
							fullResponse ||
							"I apologize, but I encountered an error. Please check your API key settings and try again.",
						isError: true,
					});
				}

				// Show user-friendly error notification
				if (errorMessage.includes("API key")) {
					showError(
						"API Key Error",
						"Please check your API key configuration in Settings.",
					);
				} else if (
					errorMessage.includes("rate limit") ||
					errorMessage.includes("quota")
				) {
					showWarning(
						"Rate Limited",
						"You have reached the API rate limit. Please try again later.",
					);
				} else {
					showError(
						"Connection Error",
						"Failed to connect to AI service. Please check your internet connection and try again.",
					);
				}

				// If there's an error and no message was added yet, add a fallback message marked as error
				if (currentProject && !currentMessageId) {
					addMessage({
						role: "assistant",
						content:
							"I apologize, but I encountered an error. Please check your API key settings and try again.",
						isError: true,
					});
				}
			} finally {
				setLoading(false);
			}
		},
		[
			currentProject,
			addMessage,
			setLoading,
			getChatService,
			updateMessage,
			showError,
			showWarning,
		],
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		sendMessage,
		isLoading,
		error,
		clearError,
		resetChatService,
		conversation: currentProject?.conversation || null,
		hasValidApiKey: hasValidApiKey(),
	};
};
