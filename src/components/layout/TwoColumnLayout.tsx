import type React from "react";

interface TwoColumnLayoutProps {
	leftColumn: React.ReactNode;
	rightColumn: React.ReactNode;
	bottomSection: React.ReactNode;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
	leftColumn,
	rightColumn,
	bottomSection,
}) => {
	return (
		<div className="flex flex-col h-full">
			{/* Two-column section - responsive layout */}
			<div className="flex-1 flex flex-col lg:flex-row min-h-0">
				{/* Left column - Chat Interface */}
				<div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col min-h-0">
					{leftColumn}
				</div>

				{/* Right column - Requirements Panel */}
				<div className="w-full lg:w-1/2 flex flex-col min-h-0">
					{rightColumn}
				</div>
			</div>

			{/* Bottom section - Prompt Generator */}
			<div className="border-t border-gray-200 max-h-96 overflow-y-auto">
				{bottomSection}
			</div>
		</div>
	);
};

export default TwoColumnLayout;
