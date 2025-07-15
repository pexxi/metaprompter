import type React from "react";
import { useProjectStore } from "../../store/project-store";
import { useSettingsStore } from "../../store/settings-store";
import Card from "../ui/Card";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

interface ChatInterfaceProps {
	onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage }) => {
	const { currentProject, isLoading } = useProjectStore();
	const { hasValidApiKey, aiProvider } = useSettingsStore();

	const handleSendMessage = (messageContent: string) => {
		if (!currentProject) return;

		// Call the parent handler to process the message
		// The parent handler will add the user message via the useChat hook
		onSendMessage(messageContent);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="border-b border-gray-200 p-4">
				<h2 className="text-lg font-semibold text-gray-900">
					Chat with AI Assistant
				</h2>
				<p className="text-sm text-gray-600 mt-1">
					Describe your software requirements and I'll help you clarify them.
				</p>

				{!hasValidApiKey() && (
					<Card className="mt-3 bg-yellow-50 border-yellow-200">
						<div className="flex items-center text-yellow-800">
							<div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
							<span className="text-sm">
								Please configure your{" "}
								{aiProvider === "openai" ? "OpenAI" : "Google Gemini"} API key
								in Settings to start chatting.
							</span>
						</div>
					</Card>
				)}
			</div>

			<MessageList
				messages={currentProject?.conversation?.messages || []}
				isLoading={isLoading}
			/>

			<div className="border-t border-gray-200 p-4">
				<MessageInput
					onSendMessage={handleSendMessage}
					disabled={isLoading || !hasValidApiKey() || !currentProject}
					placeholder={
						!currentProject
							? "Loading project..."
							: hasValidApiKey()
							? "Describe your software requirements..."
							: "Please configure your API key in Settings first"
					}
				/>
			</div>
		</div>
	);
};

export default ChatInterface;
