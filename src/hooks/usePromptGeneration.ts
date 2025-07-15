import { useCallback, useState } from "react";
import { generateComprehensivePrompt } from "../lib/prompts/generators";
import { useSpecificationStore } from "../store/specification-store";

export const usePromptGeneration = () => {
	const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { getActiveSpecification } = useSpecificationStore();

	const generatePrompt = useCallback(async () => {
		const activeSpecification = getActiveSpecification();
		if (!activeSpecification) {
			setError("No active specification found");
			return;
		}

		setIsGenerating(true);
		setError(null);

		try {
			// Add a small delay to show loading state
			await new Promise((resolve) => setTimeout(resolve, 300));

			const prompt = generateComprehensivePrompt(activeSpecification);
			setGeneratedPrompt(prompt);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to generate prompt";
			setError(errorMessage);
			console.error("Error generating prompt:", err);
		} finally {
			setIsGenerating(false);
		}
	}, [getActiveSpecification]);

	const clearPrompt = useCallback(() => {
		setGeneratedPrompt("");
		setError(null);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const copyToClipboard = useCallback(async () => {
		if (!generatedPrompt) return false;

		try {
			await navigator.clipboard.writeText(generatedPrompt);
			return true;
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
			return false;
		}
	}, [generatedPrompt]);

	const downloadPrompt = useCallback(
		(filename?: string) => {
			if (!generatedPrompt) return false;

			try {
				const blob = new Blob([generatedPrompt], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download =
					filename ||
					`software-requirements-${new Date().toISOString().split("T")[0]}.txt`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				return true;
			} catch (err) {
				console.error("Failed to download prompt:", err);
				return false;
			}
		},
		[generatedPrompt],
	);

	const getPromptStats = useCallback(() => {
		if (!generatedPrompt) {
			return {
				characters: 0,
				words: 0,
				lines: 0,
				estimatedTokens: 0,
			};
		}

		const characters = generatedPrompt.length;
		const words = generatedPrompt
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
		const lines = generatedPrompt.split("\n").length;
		// Rough estimate: ~4 characters per token on average
		const estimatedTokens = Math.ceil(characters / 4);

		return {
			characters,
			words,
			lines,
			estimatedTokens,
		};
	}, [generatedPrompt]);

	return {
		generatedPrompt,
		isGenerating,
		error,
		generatePrompt,
		clearPrompt,
		clearError,
		copyToClipboard,
		downloadPrompt,
		getPromptStats,
		hasPrompt: !!generatedPrompt,
	};
};
