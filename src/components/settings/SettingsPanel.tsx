import type React from "react";
import { useState } from "react";
import { useSettingsStore } from "../../store/settings-store";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

interface SettingsPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
	const {
		aiProvider,
		openaiApiKey,
		geminiApiKey,
		maxTokens,
		setAiProvider,
		setOpenaiApiKey,
		setGeminiApiKey,
		setMaxTokens,
		hasValidApiKey,
		isProviderConfigured,
	} = useSettingsStore();

	const [localOpenaiKey, setLocalOpenaiKey] = useState(openaiApiKey);
	const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
	const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens);

	const handleSave = () => {
		setOpenaiApiKey(localOpenaiKey);
		setGeminiApiKey(localGeminiKey);
		setMaxTokens(localMaxTokens);
		onClose();
	};

	const handleCancel = () => {
		setLocalOpenaiKey(openaiApiKey);
		setLocalGeminiKey(geminiApiKey);
		setLocalMaxTokens(maxTokens);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<h2 className="text-xl font-semibold mb-4">Settings</h2>

				<div className="space-y-4">
					{/* AI Provider Selection */}
					<Card>
						<h3 className="font-medium mb-3">AI Provider</h3>
						<div className="space-y-2">
							<label className="flex items-center">
								<input
									type="radio"
									value="openai"
									checked={aiProvider === "openai"}
									onChange={(e) =>
										setAiProvider(e.target.value as "openai" | "gemini")
									}
									className="mr-2"
								/>
								<span>OpenAI GPT</span>
								{isProviderConfigured("openai") && (
									<span className="ml-2 text-green-600 text-sm">
										✓ Configured
									</span>
								)}
							</label>
							<label className="flex items-center">
								<input
									type="radio"
									value="gemini"
									checked={aiProvider === "gemini"}
									onChange={(e) =>
										setAiProvider(e.target.value as "openai" | "gemini")
									}
									className="mr-2"
								/>
								<span>Google Gemini</span>
								{isProviderConfigured("gemini") && (
									<span className="ml-2 text-green-600 text-sm">
										✓ Configured
									</span>
								)}
							</label>
						</div>
					</Card>

					{/* API Keys */}
					<Card>
						<h3 className="font-medium mb-3">API Keys</h3>
						<div className="space-y-3">
							<Input
								type="password"
								label="OpenAI API Key"
								value={localOpenaiKey}
								onChange={(e) => setLocalOpenaiKey(e.target.value)}
								placeholder="sk-..."
								fullWidth
							/>
							<Input
								type="password"
								label="Google Gemini API Key"
								value={localGeminiKey}
								onChange={(e) => setLocalGeminiKey(e.target.value)}
								placeholder="AI..."
								fullWidth
							/>
						</div>
					</Card>

					{/* Advanced Settings */}
					<Card>
						<h3 className="font-medium mb-3">Advanced</h3>
						<Input
							type="number"
							label="Max Tokens"
							value={localMaxTokens}
							onChange={(e) =>
								setLocalMaxTokens(parseInt(e.target.value) || 4000)
							}
							min="100"
							max="8000"
							fullWidth
						/>
					</Card>

					{/* Status */}
					<Card className={`${hasValidApiKey() ? "bg-green-50" : "bg-red-50"}`}>
						<div className="flex items-center">
							<div
								className={`w-3 h-3 rounded-full mr-2 ${
									hasValidApiKey() ? "bg-green-500" : "bg-red-500"
								}`}
							></div>
							<span
								className={`text-sm ${
									hasValidApiKey() ? "text-green-800" : "text-red-800"
								}`}
							>
								{hasValidApiKey()
									? `${aiProvider === "openai" ? "OpenAI" : "Gemini"} is configured and ready`
									: `Please configure your ${aiProvider === "openai" ? "OpenAI" : "Gemini"} API key`}
							</span>
						</div>
					</Card>
				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<Button variant="secondary" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save Settings</Button>
				</div>
			</div>
		</div>
	);
};

export default SettingsPanel;
