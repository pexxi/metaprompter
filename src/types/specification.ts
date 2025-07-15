export interface Feature {
	id: string;
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
}

export interface TechnicalRequirement {
	id: string;
	category: string;
	description: string;
	importance: "required" | "preferred" | "optional";
}

export interface Constraint {
	id: string;
	type: "technical" | "business" | "design";
	description: string;
}

export interface UIRequirement {
	id: string;
	component: string;
	description: string;
	mockup?: string;
}

export interface TechStack {
	id: string;
	name: string;
	category: "frontend" | "backend" | "database" | "devops" | "library" | "framework" | "language" | "tool" | "other";
	description?: string;
}

export interface Specification {
	id: string;
	title: string;
	description: string;
	features: Feature[];
	technicalRequirements: TechnicalRequirement[];
	constraints: Constraint[];
	uiRequirements: UIRequirement[];
	techStack: TechStack[];
	createdAt: Date;
	updatedAt: Date;
	conversationId: string;
}
