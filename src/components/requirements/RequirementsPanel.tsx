import type React from "react";
import { useEffect, useState } from "react";
import { ChatService } from "../../lib/ai/chat-service";
import { SpecificationParser } from "../../lib/specification/parser";
import { useProjectStore } from "../../store/project-store";
import { useNotificationStore } from "../../store/notification-store";
import { useSettingsStore } from "../../store/settings-store";
import { nanoid } from "nanoid";
import type { Specification } from "../../types/specification";
import Button from "../ui/Button";
import Card from "../ui/Card";
import RequirementsDisplay from "./RequirementsDisplay";
import RequirementsEditor from "./RequirementsEditor";

const RequirementsPanel: React.FC = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [chatService, setChatService] = useState<ChatService | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const { currentProject, saveSpecification } = useProjectStore();

	const { aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey } =
		useSettingsStore();
	const {
		success: showSuccess,
		error: showError,
		info: showInfo,
	} = useNotificationStore();

	const activeConversation = currentProject?.conversation;
	const activeSpecification = currentProject?.specification;

	// Initialize chat service
	useEffect(() => {
		if (hasValidApiKey()) {
			const service = new ChatService({
				provider: aiProvider,
				openaiApiKey,
				geminiApiKey,
			});
			setChatService(service);
		}
	}, [aiProvider, openaiApiKey, geminiApiKey, hasValidApiKey]);

	// Create specification when project exists but has no specification
	useEffect(() => {
		if (currentProject && !activeSpecification) {
			const newSpec: Specification = {
				id: nanoid(),
				title: "",
				description: "",
				features: [],
				technicalRequirements: [],
				constraints: [],
				uiRequirements: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				conversationId: currentProject.conversation.id,
			};
			saveSpecification(newSpec);
		}
	}, [currentProject, activeSpecification, saveSpecification]);

	const handleUpdateRequirements = async () => {
		if (!activeConversation || !activeSpecification || !chatService) {
			showInfo(
				"Unable to update",
				"Please ensure you have an active conversation and valid API key.",
			);
			return;
		}

		if (activeConversation.messages.length < 2) {
			showInfo(
				"More conversation needed",
				"Have a longer conversation before extracting requirements.",
			);
			return;
		}

		setIsUpdating(true);
		try {
			const updates = await SpecificationParser.parseConversation(
				activeConversation.messages,
				chatService,
			);

			// If the current specification has no title and the AI extracted one, use it
			if (!activeSpecification.title && updates.title) {
				updates.title = updates.title;
			} else if (activeSpecification.title && !updates.title) {
				// If we have a title but AI didn't extract one, keep the existing title
				updates.title = activeSpecification.title;
			}

			const updatedSpec = {
				...activeSpecification,
				...updates,
				updatedAt: new Date(),
			};
			await saveSpecification(updatedSpec);

			const totalRequirements =
				(updates.features?.length || 0) +
				(updates.technicalRequirements?.length || 0) +
				(updates.uiRequirements?.length || 0) +
				(updates.constraints?.length || 0);

			if (totalRequirements > 0) {
				const titleMsg =
					updates.title && !activeSpecification.title
						? ` Project title set to "${updates.title}".`
						: "";
				showSuccess(
					"Requirements updated",
					`Extracted ${totalRequirements} requirements from your conversation.${titleMsg}`,
				);
			} else {
				showInfo(
					"No requirements found",
					"Try discussing specific features, technologies, or constraints in your conversation.",
				);
			}
		} catch (error) {
			console.error("Error updating requirements:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";

			if (errorMessage.includes("API key")) {
				showError(
					"API Key Error",
					"Please check your API key configuration in Settings.",
				);
			} else {
				showError(
					"Update failed",
					"Unable to extract requirements. Please try again or edit them manually.",
				);
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleSaveEdits = async (updates: any) => {
		if (activeSpecification) {
			const updatedSpec = {
				...activeSpecification,
				...updates,
				updatedAt: new Date(),
			};
			await saveSpecification(updatedSpec);
			setIsEditing(false);
			showSuccess(
				"Requirements saved",
				"Your manual edits have been saved successfully.",
			);
		}
	};

	const handleCancelEdits = () => {
		setIsEditing(false);
	};

	if (!activeSpecification) {
		return (
			<div className="flex flex-col h-full p-4 lg:p-6">
				<h2 className="text-lg lg:text-xl font-semibold mb-4">Requirements</h2>
				<div className="flex-1 flex items-center justify-center">
					<Card className="text-center">
						<p className="text-gray-500">
							Start a conversation to begin gathering requirements.
						</p>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full p-4 lg:p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg lg:text-xl font-semibold">Requirements</h2>
				<div className="flex gap-2">
					{!isEditing && (
						<>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => setIsEditing(true)}
								disabled={isUpdating}
							>
								Edit
							</Button>
							<Button
								size="sm"
								onClick={handleUpdateRequirements}
								disabled={
									isUpdating ||
									!hasValidApiKey() ||
									!activeConversation?.messages.length
								}
								loading={isUpdating}
							>
								Update Requirements
							</Button>
						</>
					)}
				</div>
			</div>

			{!hasValidApiKey() && (
				<Card className="mb-4 bg-yellow-50 border-yellow-200">
					<div className="flex items-center text-yellow-800">
						<div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
						<span className="text-sm">
							Configure your API key in Settings to automatically extract
							requirements from conversations.
						</span>
					</div>
				</Card>
			)}

			<div className="flex-1 min-h-0 overflow-y-auto">
				{isEditing ? (
					<RequirementsEditor
						specification={activeSpecification}
						onSave={handleSaveEdits}
						onCancel={handleCancelEdits}
					/>
				) : (
					<RequirementsDisplay specification={activeSpecification} />
				)}
			</div>
		</div>
	);
};

export default RequirementsPanel;
