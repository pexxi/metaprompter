/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import type React from "react";
import { useState } from "react";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useProjectStore } from "../../store/project-store";

interface ProjectDropdownProps {
	onProjectSelect: (projectId: string) => void;
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
	onProjectSelect,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredProject, setHoveredProject] = useState<string | null>(null);
	const { projectSummaries, currentProject, deleteProject } = useProjectStore();

	const handleProjectSelect = (projectId: string) => {
		onProjectSelect(projectId);
		setIsOpen(false);
	};

	const handleDeleteProject = async (
		projectId: string,
		event: React.MouseEvent,
	) => {
		event.stopPropagation();

		if (
			confirm(
				"Are you sure you want to delete this project? This action cannot be undone.",
			)
		) {
			try {
				await deleteProject(projectId);
			} catch (error) {
				console.error("Failed to delete project:", error);
				alert("Failed to delete project. Please try again.");
			}
		}
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
			>
				<span>Recent Projects</span>
				<ChevronDownIcon className="h-4 w-4" />
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
					<div className="py-1 max-h-96 overflow-y-auto">
						{projectSummaries.length === 0 ? (
							<div className="px-4 py-3 text-sm text-gray-500">
								No recent projects found
							</div>
						) : (
							projectSummaries.map((project) => (
								<div
									key={project.id}
									className="relative"
									onMouseEnter={() => setHoveredProject(project.id)}
									onMouseLeave={() => setHoveredProject(null)}
								>
									<button
										type="button"
										onClick={() => handleProjectSelect(project.id)}
										className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
											currentProject?.id === project.id
												? "bg-blue-50 text-blue-700"
												: "text-gray-900"
										}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0 pr-8">
												<div className="font-medium truncate">
													{project.name || "Untitled Project"}
												</div>
												{project.description && (
													<div className="text-gray-500 text-xs truncate mt-1">
														{project.description}
													</div>
												)}
												<div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
													<span>{formatDate(project.updatedAt)}</span>
													<span>{project.messageCount} messages</span>
													<span>{project.featureCount} features</span>
												</div>
											</div>
										</div>
									</button>
									{hoveredProject === project.id && (
										<button
											type="button"
											onClick={(e) => handleDeleteProject(project.id, e)}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
											title="Delete project"
										>
											<TrashIcon className="h-4 w-4" />
										</button>
									)}
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* Overlay to close dropdown when clicking outside */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setIsOpen(false);
						}
					}}
				/>
			)}
		</div>
	);
};

export default ProjectDropdown;
