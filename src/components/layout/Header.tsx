import type React from "react";

interface HeaderProps {
	onNewProject: () => void;
	projectTitle?: string;
	onProjectTitleChange?: (title: string) => void;
	onOpenSettings: () => void;
	projectDropdown?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
	onNewProject,
	projectTitle,
	onProjectTitleChange,
	onOpenSettings,
	projectDropdown,
}) => {
	return (
		<header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
					<h1 className="text-xl lg:text-2xl font-bold text-gray-900">
						MetaPrompter
					</h1>
					{onProjectTitleChange && (
						<input
							type="text"
							value={projectTitle || ""}
							onChange={(e) => onProjectTitleChange(e.target.value)}
							placeholder="Project title..."
							className="text-base lg:text-lg font-medium text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full xs:w-auto"
						/>
					)}
				</div>

				<div className="flex gap-2 w-full sm:w-auto">
					{projectDropdown}
					<button
						type="button"
						onClick={onOpenSettings}
						className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none justify-center"
					>
						Settings
					</button>
					<button
						type="button"
						onClick={onNewProject}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none justify-center"
					>
						New Project
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
