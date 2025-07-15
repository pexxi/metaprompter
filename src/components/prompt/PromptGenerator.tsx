import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useProjectStore } from "../../store/project-store";
import { useNotificationStore } from "../../store/notification-store";
import { useSettingsStore } from "../../store/settings-store";
import { nanoid } from "nanoid";
import type { GeneratedPrompt } from "../../types/prompt";
import { PromptGenerationService } from "../../lib/ai/prompt-generation-service";
import { ChatService } from "../../lib/ai/chat-service";
import Button from "../ui/Button";
import Card from "../ui/Card";
import PromptOutput from "./PromptOutput";

const PromptGenerator: React.FC = () => {
	const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [targetPlatform, setTargetPlatform] = useState<"lovable" | "v0" | "replit" | "general">("general");

	const { currentProject, saveGeneratedPrompt } = useProjectStore();
	const {
		success: showSuccess,
		error: showError,
		info: showInfo,
	} = useNotificationStore();
	const { getAISettings } = useSettingsStore();

	const activeSpecification = currentProject?.specification;
	const activeConversation = currentProject?.conversation;

	// Load latest generated prompt when project changes
	useEffect(() => {
		if (
			currentProject?.generatedPrompts &&
			currentProject.generatedPrompts.length > 0
		) {
			setGeneratedPrompt(currentProject.generatedPrompts[0].content);
		} else {
			setGeneratedPrompt("");
		}
	}, [currentProject]);

	const handleGeneratePrompt = useCallback(async () => {
		if (!activeSpecification) {
			showInfo(
				"No requirements",
				"Please add some requirements before generating a prompt.",
			);
			return;
		}

		setIsGenerating(true);
		try {
			const aiSettings = getAISettings();
			if (!aiSettings.openaiApiKey && !aiSettings.geminiApiKey) {
				showError(
					"AI API key required",
					"Please configure your AI API key in settings to generate prompts.",
				);
				return;
			}

			const chatService = new ChatService(aiSettings);
			const promptService = new PromptGenerationService(chatService);

			const context = {
				specification: activeSpecification,
				conversation: activeConversation,
				targetPlatform,
			};

			let prompt = "";
			await promptService.generateComprehensivePromptStream(
				context,
				(chunk: string) => {
					prompt += chunk;
					setGeneratedPrompt(prompt);
				},
			);

			// Save to database
			const generatedPrompt: GeneratedPrompt = {
				id: nanoid(),
				content: prompt,
				createdAt: new Date(),
				specificationId: activeSpecification.id,
				targetPlatform,
				generatedWithLLM: true,
			};
			await saveGeneratedPrompt(generatedPrompt);

			const wordCount = prompt
				.split(/\s+/)
				.filter((word: string) => word.length > 0).length;
			showSuccess(
				"Prompt generated",
				`Created a ${wordCount}-word comprehensive prompt optimized for ${targetPlatform}.`,
			);
		} catch (error) {
			console.error("Error generating prompt:", error);
			showError(
				"Generation failed",
				"Unable to generate prompt. Please try again.",
			);
		} finally {
			setIsGenerating(false);
		}
	}, [
		activeSpecification,
		activeConversation,
		targetPlatform,
		getAISettings,
		saveGeneratedPrompt,
		showSuccess,
		showError,
		showInfo,
	]);

	// Auto-generate prompt when specification changes significantly
	useEffect(() => {
		if (activeSpecification && generatedPrompt && !isGenerating) {
			// Check if specification has meaningful content
			const hasContent =
				activeSpecification.features.length > 0 ||
				activeSpecification.technicalRequirements.length > 0 ||
				activeSpecification.uiRequirements.length > 0 ||
				activeSpecification.constraints.length > 0 ||
				activeSpecification.title ||
				activeSpecification.description;

			if (hasContent) {
				// Auto-regenerate if specification was updated recently (within 5 seconds)
				const timeSinceUpdate =
					Date.now() - new Date(activeSpecification.updatedAt).getTime();
				if (timeSinceUpdate < 5000) {
					handleGeneratePrompt();
				}
			}
		}
	}, [
		activeSpecification?.updatedAt,
		activeSpecification,
		generatedPrompt,
		isGenerating,
		handleGeneratePrompt,
	]);

	const handleCopy = () => {
		showInfo(
			"Copied to clipboard",
			"Prompt has been copied and is ready to paste into your AI tool.",
		);
	};

	const handleDownload = () => {
		showInfo(
			"Download started",
			"Prompt file has been downloaded to your device.",
		);
	};

	const canGeneratePrompt =
		activeSpecification &&
		(activeSpecification.features.length > 0 ||
			activeSpecification.technicalRequirements.length > 0 ||
			activeSpecification.uiRequirements.length > 0 ||
			activeSpecification.constraints.length > 0 ||
			activeSpecification.title ||
			activeSpecification.description);

	if (!activeSpecification) {
		return (
			<div className="p-4 lg:p-6 h-full flex items-center justify-center">
				<Card className="text-center max-w-md">
					<h3 className="text-lg font-semibold mb-2">Prompt Generator</h3>
					<p className="text-gray-500">
						Start a conversation and gather some requirements to generate a
						comprehensive software development prompt.
					</p>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-4 lg:p-6 h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-lg lg:text-xl font-semibold">Prompt Generator</h2>
					<p className="text-sm text-gray-600">
						Generate a comprehensive software development prompt from your
						requirements
					</p>
				</div>
				<div className="flex items-center gap-3">
					<select
						value={targetPlatform}
						onChange={(e) => setTargetPlatform(e.target.value as typeof targetPlatform)}
						className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={isGenerating}
					>
						<option value="general">General</option>
						<option value="lovable">Lovable</option>
						<option value="v0">v0</option>
						<option value="replit">Replit</option>
					</select>
					<Button
						onClick={handleGeneratePrompt}
						disabled={!canGeneratePrompt}
						loading={isGenerating}
					>
						Generate Prompt
					</Button>
				</div>
			</div>

			{!canGeneratePrompt && (
				<Card className="mb-4 bg-blue-50 border-blue-200">
					<div className="flex items-center text-blue-800">
						<div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
						<span className="text-sm">
							Add some requirements in the conversation or requirements panel to
							generate a prompt.
						</span>
					</div>
				</Card>
			)}

			<div className="flex-1 min-h-0">
				<PromptOutput
					prompt={generatedPrompt}
					onCopy={handleCopy}
					onDownload={handleDownload}
				/>
			</div>

			{generatedPrompt && (
				<div className="mt-4 pt-4 border-t">
					<div className="flex items-center justify-between text-sm text-gray-600">
						<div className="flex items-center gap-4">
							<span>
								Based on {activeSpecification.features.length} features,{" "}
								{activeSpecification.technicalRequirements.length} technical
								requirements
							</span>
							{activeConversation && (
								<span>
									• {activeConversation.messages.length} messages in
									conversation
								</span>
							)}
						</div>
						<div className="text-xs text-gray-400">
							Last updated:{" "}
							{new Date(activeSpecification.updatedAt).toLocaleString()}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PromptGenerator;
