import type React from "react";
import { useEffect, useState } from "react";
import type { Specification } from "../../types/specification";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

interface RequirementsEditorProps {
	specification: Specification;
	onSave: (updates: Partial<Specification>) => void;
	onCancel: () => void;
}

const RequirementsEditor: React.FC<RequirementsEditorProps> = ({
	specification,
	onSave,
	onCancel,
}) => {
	const [editedSpec, setEditedSpec] = useState<Specification>(specification);

	useEffect(() => {
		setEditedSpec(specification);
	}, [specification]);

	const handleSave = () => {
		onSave(editedSpec);
	};

	const addFeature = () => {
		const newFeature = {
			id: `feature_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			title: "",
			description: "",
			priority: "medium" as const,
		};
		setEditedSpec({
			...editedSpec,
			features: [...editedSpec.features, newFeature],
		});
	};

	const updateFeature = (id: string, updates: any) => {
		setEditedSpec({
			...editedSpec,
			features: editedSpec.features.map((feature) =>
				feature.id === id ? { ...feature, ...updates } : feature,
			),
		});
	};

	const removeFeature = (id: string) => {
		setEditedSpec({
			...editedSpec,
			features: editedSpec.features.filter((feature) => feature.id !== id),
		});
	};

	const addTechnicalRequirement = () => {
		const newReq = {
			id: `tech_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			category: "framework" as const,
			description: "",
			importance: "preferred" as const,
		};
		setEditedSpec({
			...editedSpec,
			technicalRequirements: [...editedSpec.technicalRequirements, newReq],
		});
	};

	const updateTechnicalRequirement = (id: string, updates: any) => {
		setEditedSpec({
			...editedSpec,
			technicalRequirements: editedSpec.technicalRequirements.map((req) =>
				req.id === id ? { ...req, ...updates } : req,
			),
		});
	};

	const removeTechnicalRequirement = (id: string) => {
		setEditedSpec({
			...editedSpec,
			technicalRequirements: editedSpec.technicalRequirements.filter(
				(req) => req.id !== id,
			),
		});
	};

	return (
		<div className="space-y-4 max-h-full overflow-y-auto">
			{/* Project Overview */}
			<Card>
				<h3 className="font-semibold text-lg mb-3">Project Overview</h3>
				<div className="space-y-3">
					<Input
						label="Title"
						value={editedSpec.title}
						onChange={(e) =>
							setEditedSpec({ ...editedSpec, title: e.target.value })
						}
						placeholder="Enter project title"
						fullWidth
					/>
					<Textarea
						label="Description"
						value={editedSpec.description}
						onChange={(e) =>
							setEditedSpec({ ...editedSpec, description: e.target.value })
						}
						placeholder="Enter project description"
						fullWidth
						rows={3}
					/>
				</div>
			</Card>

			{/* Features */}
			<Card>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-semibold text-lg">Features</h3>
					<Button size="sm" onClick={addFeature}>
						Add Feature
					</Button>
				</div>
				<div className="space-y-3">
					{editedSpec.features.map((feature) => (
						<div key={feature.id} className="border rounded-lg p-3 bg-gray-50">
							<div className="flex items-start justify-between mb-2">
								<Input
									value={feature.title}
									onChange={(e) =>
										updateFeature(feature.id, { title: e.target.value })
									}
									placeholder="Feature title"
									className="flex-1 mr-2"
								/>
								<select
									value={feature.priority}
									onChange={(e) =>
										updateFeature(feature.id, { priority: e.target.value })
									}
									className="px-2 py-1 border border-gray-300 rounded text-sm"
								>
									<option value="high">High</option>
									<option value="medium">Medium</option>
									<option value="low">Low</option>
								</select>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => removeFeature(feature.id)}
									className="ml-2 text-red-600 hover:text-red-800"
								>
									×
								</Button>
							</div>
							<Textarea
								value={feature.description}
								onChange={(e) =>
									updateFeature(feature.id, { description: e.target.value })
								}
								placeholder="Feature description"
								fullWidth
								rows={2}
							/>
						</div>
					))}
				</div>
			</Card>

			{/* Technical Requirements */}
			<Card>
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-semibold text-lg">Technical Requirements</h3>
					<Button size="sm" onClick={addTechnicalRequirement}>
						Add Requirement
					</Button>
				</div>
				<div className="space-y-3">
					{editedSpec.technicalRequirements.map((req) => (
						<div key={req.id} className="border rounded-lg p-3 bg-gray-50">
							<div className="flex items-start justify-between mb-2">
								<select
									value={req.category}
									onChange={(e) =>
										updateTechnicalRequirement(req.id, {
											category: e.target.value,
										})
									}
									className="px-2 py-1 border border-gray-300 rounded text-sm mr-2"
								>
									<option value="framework">Framework</option>
									<option value="database">Database</option>
									<option value="infrastructure">Infrastructure</option>
									<option value="integration">Integration</option>
									<option value="security">Security</option>
									<option value="performance">Performance</option>
								</select>
								<select
									value={req.importance}
									onChange={(e) =>
										updateTechnicalRequirement(req.id, {
											importance: e.target.value,
										})
									}
									className="px-2 py-1 border border-gray-300 rounded text-sm"
								>
									<option value="required">Required</option>
									<option value="preferred">Preferred</option>
									<option value="optional">Optional</option>
								</select>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => removeTechnicalRequirement(req.id)}
									className="ml-2 text-red-600 hover:text-red-800"
								>
									×
								</Button>
							</div>
							<Textarea
								value={req.description}
								onChange={(e) =>
									updateTechnicalRequirement(req.id, {
										description: e.target.value,
									})
								}
								placeholder="Requirement description"
								fullWidth
								rows={2}
							/>
						</div>
					))}
				</div>
			</Card>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3 pt-4 border-t">
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Changes</Button>
			</div>
		</div>
	);
};

export default RequirementsEditor;
