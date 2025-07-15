import type React from "react";
import type { Specification } from "../../types/specification";
import Card from "../ui/Card";

interface RequirementsDisplayProps {
	specification: Specification;
}

const RequirementsDisplay: React.FC<RequirementsDisplayProps> = ({
	specification,
}) => {
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "text-red-600 bg-red-100";
			case "medium":
				return "text-yellow-600 bg-yellow-100";
			case "low":
				return "text-green-600 bg-green-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getImportanceColor = (importance: string) => {
		switch (importance) {
			case "required":
				return "text-red-600 bg-red-100";
			case "preferred":
				return "text-blue-600 bg-blue-100";
			case "optional":
				return "text-gray-600 bg-gray-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getConstraintTypeColor = (type: string) => {
		switch (type) {
			case "technical":
				return "text-purple-600 bg-purple-100";
			case "business":
				return "text-blue-600 bg-blue-100";
			case "design":
				return "text-green-600 bg-green-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getTechStackCategoryColor = (category: string) => {
		switch (category) {
			case "frontend":
				return "text-blue-600 bg-blue-100";
			case "backend":
				return "text-green-600 bg-green-100";
			case "database":
				return "text-purple-600 bg-purple-100";
			case "devops":
				return "text-orange-600 bg-orange-100";
			case "library":
				return "text-cyan-600 bg-cyan-100";
			case "framework":
				return "text-indigo-600 bg-indigo-100";
			case "language":
				return "text-red-600 bg-red-100";
			case "tool":
				return "text-gray-600 bg-gray-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	return (
		<div className="space-y-4">
			{/* Project Overview */}
			<Card>
				<h3 className="font-semibold text-lg mb-2">Project Overview</h3>
				<div className="space-y-2">
					<div>
						<label className="text-sm font-medium text-gray-700">Title:</label>
						<p className="text-gray-900">
							{specification.title || "Untitled Project"}
						</p>
					</div>
					<div>
						<label className="text-sm font-medium text-gray-700">
							Description:
						</label>
						<p className="text-gray-900">
							{specification.description || "No description provided"}
						</p>
					</div>
				</div>
			</Card>

			{/* Features */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">
					Features ({specification.features.length})
				</h3>
				{specification.features.length === 0 ? (
					<p className="text-gray-500 text-sm">No features identified yet</p>
				) : (
					<div className="space-y-3">
						{specification.features.map((feature) => (
							<div key={feature.id} className="border-l-4 border-blue-200 pl-3">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">
											{feature.title}
										</h4>
										<p className="text-sm text-gray-600 mt-1">
											{feature.description}
										</p>
									</div>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}
									>
										{feature.priority}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Technical Requirements */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">
					Technical Requirements ({specification.technicalRequirements.length})
				</h3>
				{specification.technicalRequirements.length === 0 ? (
					<p className="text-gray-500 text-sm">
						No technical requirements specified yet
					</p>
				) : (
					<div className="space-y-3">
						{specification.technicalRequirements.map((req) => (
							<div key={req.id} className="border-l-4 border-purple-200 pl-3">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className="font-medium text-gray-900 capitalize">
												{req.category}
											</h4>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(req.importance)}`}
											>
												{req.importance}
											</span>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											{req.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Constraints */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">
					Constraints ({specification.constraints.length})
				</h3>
				{specification.constraints.length === 0 ? (
					<p className="text-gray-500 text-sm">No constraints identified yet</p>
				) : (
					<div className="space-y-3">
						{specification.constraints.map((constraint) => (
							<div
								key={constraint.id}
								className="border-l-4 border-yellow-200 pl-3"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getConstraintTypeColor(constraint.type)}`}
											>
												{constraint.type}
											</span>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											{constraint.description}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* UI Requirements */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">
					UI Requirements ({specification.uiRequirements.length})
				</h3>
				{specification.uiRequirements.length === 0 ? (
					<p className="text-gray-500 text-sm">
						No UI requirements specified yet
					</p>
				) : (
					<div className="space-y-3">
						{specification.uiRequirements.map((req) => (
							<div key={req.id} className="border-l-4 border-green-200 pl-3">
								<div className="flex-1">
									<h4 className="font-medium text-gray-900">{req.component}</h4>
									<p className="text-sm text-gray-600 mt-1">
										{req.description}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Tech Stack */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">
					Tech Stack ({specification.techStack.length})
				</h3>
				{specification.techStack.length === 0 ? (
					<p className="text-gray-500 text-sm">
						No technologies specified yet
					</p>
				) : (
					<div className="space-y-3">
						{specification.techStack.map((tech) => (
							<div key={tech.id} className="border-l-4 border-indigo-200 pl-3">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className="font-medium text-gray-900">{tech.name}</h4>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getTechStackCategoryColor(tech.category)}`}
											>
												{tech.category}
											</span>
										</div>
										{tech.description && (
											<p className="text-sm text-gray-600 mt-1">
												{tech.description}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
};

export default RequirementsDisplay;
