import { useCallback } from "react";
import { ChatService } from "../lib/ai/chat-service";
import { SpecificationParser } from "../lib/specification/parser";
import { useChatStore } from "../store/chat-store";
import { useSettingsStore } from "../store/settings-store";
import { useSpecificationStore } from "../store/specification-store";

export const useSpecification = () => {
	const {
		getActiveSpecification,
		getSpecificationByConversation,
		createSpecification,
		updateSpecification,
		setUpdating,
		isUpdating,
	} = useSpecificationStore();

	const { getActiveConversation, activeConversationId } = useChatStore();
	const { aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey } =
		useSettingsStore();

	const getChatService = useCallback(() => {
		if (!hasValidApiKey()) {
			throw new Error("No API key configured");
		}

		return new ChatService({
			provider: aiProvider,
			openaiApiKey,
			geminiApiKey,
		});
	}, [aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey]);

	const updateRequirements = useCallback(async () => {
		if (!activeConversationId || !hasValidApiKey()) return;

		const conversation = getActiveConversation();
		if (!conversation || conversation.messages.length === 0) return;

		let specification = getActiveSpecification();
		if (!specification) {
			const existingSpec = getSpecificationByConversation(activeConversationId);
			if (existingSpec) {
				specification = existingSpec;
			} else {
				const specId = createSpecification(activeConversationId);
				specification = { id: specId } as any; // Will be properly loaded after creation
			}
		}

		if (!specification) return;

		setUpdating(true);
		try {
			const chatService = getChatService();
			const updates = await SpecificationParser.parseConversation(
				conversation.messages,
				chatService,
			);

			updateSpecification(specification.id, updates);
		} catch (error) {
			console.error("Error updating requirements:", error);
			throw error;
		} finally {
			setUpdating(false);
		}
	}, [
		activeConversationId,
		getActiveConversation,
		getActiveSpecification,
		getSpecificationByConversation,
		createSpecification,
		updateSpecification,
		setUpdating,
		getChatService,
		hasValidApiKey,
	]);

	const ensureSpecificationExists = useCallback(() => {
		if (!activeConversationId) return null;

		let specification = getActiveSpecification();
		if (!specification) {
			const existingSpec = getSpecificationByConversation(activeConversationId);
			if (existingSpec) {
				specification = existingSpec;
			} else {
				createSpecification(activeConversationId);
				specification = getActiveSpecification(); // Get the newly created specification
			}
		}

		return specification;
	}, [
		activeConversationId,
		getActiveSpecification,
		getSpecificationByConversation,
		createSpecification,
	]);

	return {
		activeSpecification: getActiveSpecification(),
		isUpdating,
		updateRequirements,
		ensureSpecificationExists,
		hasValidApiKey: hasValidApiKey(),
	};
};
