import type React from "react";
import { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface PromptOutputProps {
	prompt: string;
	onCopy?: () => void;
	onDownload?: () => void;
}

const PromptOutput: React.FC<PromptOutputProps> = ({
	prompt,
	onCopy,
	onDownload,
}) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			setCopied(true);
			onCopy?.();
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	const handleDownload = () => {
		const blob = new Blob([prompt], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `software-requirements-${new Date().toISOString().split("T")[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		onDownload?.();
	};

	const promptStats = {
		characters: prompt.length,
		words: prompt.split(/\s+/).filter((word) => word.length > 0).length,
		lines: prompt.split("\n").length,
	};

	return (
		<Card className="h-full flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Generated Prompt</h3>
				<div className="flex gap-2">
					<Button
						type="button"
						size="sm"
						variant="secondary"
						onClick={handleDownload}
						disabled={!prompt.trim()}
					>
						Download
					</Button>
					<Button
						type="button"
						size="sm"
						onClick={handleCopy}
						disabled={!prompt.trim()}
					>
						{copied ? "Copied!" : "Copy"}
					</Button>
				</div>
			</div>

			{prompt.trim() ? (
				<>
					<div className="flex-1 min-h-0 mb-4">
						<div className="h-full border rounded-lg p-4 bg-gray-50 overflow-y-auto">
							<pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
								{prompt}
							</pre>
						</div>
					</div>

					<div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t">
						<div className="flex gap-4">
							<span>{promptStats.characters.toLocaleString()} characters</span>
							<span>{promptStats.words.toLocaleString()} words</span>
							<span>{promptStats.lines.toLocaleString()} lines</span>
						</div>
						<div className="text-xs text-gray-400">
							Generated at {new Date().toLocaleTimeString()}
						</div>
					</div>
				</>
			) : (
				<div className="flex-1 flex items-center justify-center text-center">
					<div className="text-gray-500">
						<p className="text-lg mb-2">No prompt generated yet</p>
						<p className="text-sm">
							Click "Generate Prompt" to create a comprehensive software
							development prompt from your requirements.
						</p>
					</div>
				</div>
			)}
		</Card>
	);
};

export default PromptOutput;
