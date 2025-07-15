import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";

interface MessageInputProps {
	onSendMessage: (message: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
	onSendMessage,
	disabled = false,
	placeholder = "Type your message...",
}) => {
	const [message, setMessage] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() && !disabled) {
			onSendMessage(message.trim());
			setMessage("");
			// Reset textarea height after sending
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
		autoResizeTextarea();
	};

	const autoResizeTextarea = useCallback(() => {
		if (textareaRef.current) {
			const textarea = textareaRef.current;

			// Reset height to measure content
			textarea.style.height = "auto";

			// Calculate line height and padding
			const computedStyle = window.getComputedStyle(textarea);
			const lineHeight = parseInt(computedStyle.lineHeight) || 24; // fallback to 24px
			const paddingTop = parseInt(computedStyle.paddingTop) || 0;
			const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

			// Calculate heights
			const minHeight = lineHeight + paddingTop + paddingBottom;
			const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;

			// Set height based on content, with min/max constraints
			const contentHeight = textarea.scrollHeight;
			const newHeight = Math.max(minHeight, Math.min(contentHeight, maxHeight));

			textarea.style.height = `${newHeight}px`;

			// Enable scrolling if content exceeds max height
			if (contentHeight > maxHeight) {
				textarea.style.overflowY = "auto";
			} else {
				textarea.style.overflowY = "hidden";
			}
		}
	}, []);

	useEffect(() => {
		autoResizeTextarea();
	}, [message, autoResizeTextarea]);

	// Initialize textarea height on mount
	useEffect(() => {
		autoResizeTextarea();
	}, [autoResizeTextarea]);

	return (
		<form onSubmit={handleSubmit} className="flex items-end space-x-2">
			<div className="flex-1">
				<textarea
					ref={textareaRef}
					value={message}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[2.5rem] leading-6"
					rows={1}
				/>
			</div>
			<Button
				type="submit"
				disabled={disabled || !message.trim()}
				loading={disabled}
				className="mb-0"
			>
				Send
			</Button>
		</form>
	);
};

export default MessageInput;
