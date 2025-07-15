import type React from "react";
import { useEffect, useRef } from "react";
import type { Message } from "../../types/chat";
import Card from "../ui/Card";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
	messages: Message[];
	isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
	messages,
	isLoading = false,
}) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	const formatTimestamp = (timestamp: Date) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.length === 0 && !isLoading ? (
				<div className="text-center text-gray-500 py-8">
					<p>
						No messages yet. Start by describing your software requirements!
					</p>
				</div>
			) : (
				<>
					{messages
						.filter((message) => {
							// Hide empty messages when loading (they're just placeholders for streaming)
							if (isLoading && message.content.trim() === "") {
								return false;
							}
							return true;
						})
						.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-xs lg:max-w-md xl:max-w-lg ${
										message.role === "user" ? "ml-auto" : "mr-auto"
									}`}
								>
									<Card
										className={`${
											message.role === "user"
												? "bg-blue-600 text-white"
												: "bg-gray-50 text-gray-900"
										}`}
										padding="sm"
									>
										<div className="whitespace-pre-wrap text-sm">
											{message.content}
										</div>
										<div
											className={`text-xs mt-2 ${
												message.role === "user"
													? "text-blue-200"
													: "text-gray-500"
											}`}
										>
											{formatTimestamp(message.timestamp)}
										</div>
									</Card>
								</div>
							</div>
						))}

					{isLoading && (
						<div className="flex justify-start">
							<div className="max-w-xs lg:max-w-md xl:max-w-lg mr-auto">
								<Card className="bg-gray-50" padding="sm">
									<TypingIndicator />
								</Card>
							</div>
						</div>
					)}
				</>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
};

export default MessageList;
