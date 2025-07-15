import type { Message } from "../../types/chat";

/**
 * Filters and processes messages before sending to LLM to avoid role sequence errors
 */
export function filterMessagesForLLM(messages: Message[]): Message[] {
	// Step 1: Filter out error messages and special context messages
	const validMessages = messages.filter(
		(msg) =>
			!msg.isError &&
			msg.id !== "initial" &&
			msg.id !== "context" &&
			msg.content.trim() !== "",
	);

	// Step 2: Remove duplicate consecutive messages with same content
	const deduplicatedMessages = validMessages.filter((msg, index) => {
		if (index === 0) return true;
		const prevMsg = validMessages[index - 1];
		return !(msg.role === prevMsg.role && msg.content === prevMsg.content);
	});

	// Step 3: Concatenate consecutive user messages
	const processedMessages: Message[] = [];

	for (let i = 0; i < deduplicatedMessages.length; i++) {
		const currentMsg = deduplicatedMessages[i];

		if (currentMsg.role === "user") {
			// Check if there are consecutive user messages
			let concatenatedContent = currentMsg.content;
			let j = i + 1;

			while (
				j < deduplicatedMessages.length &&
				deduplicatedMessages[j].role === "user"
			) {
				concatenatedContent += "\n\n" + deduplicatedMessages[j].content;
				j++;
			}

			// Add the concatenated user message
			processedMessages.push({
				...currentMsg,
				content: concatenatedContent,
			});

			// Skip the messages we just concatenated
			i = j - 1;
		} else {
			// For assistant messages, add as-is
			processedMessages.push(currentMsg);
		}
	}

	return processedMessages;
}
