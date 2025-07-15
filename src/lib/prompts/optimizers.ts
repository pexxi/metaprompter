import type { Specification } from "../../types/specification";

/**
 * Optimizes a prompt for better clarity and AI understanding
 */
export function optimizePrompt(prompt: string): string {
	let optimized = prompt;

	// Remove excessive whitespace
	optimized = optimized.replace(/\n\s*\n\s*\n/g, "\n\n");

	// Ensure proper section spacing
	optimized = optimized.replace(/^(#{1,6}\s)/gm, "\n$1");

	// Add emphasis to important sections
	optimized = optimized.replace(/^(## [^#])/gm, "\n$1");

	// Clean up and normalize
	optimized = optimized.trim();

	return optimized;
}

/**
 * Validates that a specification has sufficient content for prompt generation
 */
export function validateSpecification(specification: Specification): {
	isValid: boolean;
	warnings: string[];
	suggestions: string[];
} {
	const warnings: string[] = [];
	const suggestions: string[] = [];

	// Check for basic content
	if (!specification.title) {
		warnings.push("Project title is missing");
		suggestions.push("Add a descriptive project title");
	}

	if (!specification.description) {
		warnings.push("Project description is missing");
		suggestions.push("Add a detailed project description");
	}

	if (specification.features.length === 0) {
		warnings.push("No features defined");
		suggestions.push("Add at least one feature requirement");
	}

	if (specification.technicalRequirements.length === 0) {
		warnings.push("No technical requirements specified");
		suggestions.push(
			"Add technical requirements like framework, database, etc.",
		);
	}

	// Check for feature quality
	const featuresWithoutDescription = specification.features.filter(
		(f) => !f.description,
	);
	if (featuresWithoutDescription.length > 0) {
		warnings.push(
			`${featuresWithoutDescription.length} features lack descriptions`,
		);
		suggestions.push("Add detailed descriptions to all features");
	}

	// Check for technical requirement quality
	const techReqsWithoutDescription = specification.technicalRequirements.filter(
		(req) => !req.description,
	);
	if (techReqsWithoutDescription.length > 0) {
		warnings.push(
			`${techReqsWithoutDescription.length} technical requirements lack descriptions`,
		);
		suggestions.push("Add detailed descriptions to all technical requirements");
	}

	// Check for balanced priority distribution
	const highPriorityCount = specification.features.filter(
		(f) => f.priority === "high",
	).length;
	const totalFeatures = specification.features.length;

	if (totalFeatures > 0 && highPriorityCount === totalFeatures) {
		warnings.push("All features are marked as high priority");
		suggestions.push(
			"Consider prioritizing features as high, medium, or low priority",
		);
	}

	if (totalFeatures > 0 && highPriorityCount === 0) {
		warnings.push("No high priority features identified");
		suggestions.push("Mark your most important features as high priority");
	}

	// Check for UI requirements
	if (specification.uiRequirements.length === 0) {
		suggestions.push(
			"Consider adding UI/UX requirements for better design guidance",
		);
	}

	// Check for constraints
	if (specification.constraints.length === 0) {
		suggestions.push(
			"Consider adding constraints (technical, business, or design limitations)",
		);
	}

	const isValid =
		warnings.length === 0 &&
		(specification.features.length > 0 ||
			specification.technicalRequirements.length > 0 ||
			!!specification.description);

	return {
		isValid,
		warnings,
		suggestions,
	};
}

/**
 * Estimates the complexity of a specification for prompt generation
 */
export function estimateComplexity(specification: Specification): {
	level: "simple" | "moderate" | "complex" | "very_complex";
	score: number;
	factors: string[];
} {
	let score = 0;
	const factors: string[] = [];

	// Feature complexity
	const featureCount = specification.features.length;
	if (featureCount > 0) {
		score += Math.min(featureCount * 10, 50);
		factors.push(`${featureCount} features`);
	}

	// Technical complexity
	const techReqCount = specification.technicalRequirements.length;
	const requiredTechCount = specification.technicalRequirements.filter(
		(req) => req.importance === "required",
	).length;
	if (techReqCount > 0) {
		score += Math.min(techReqCount * 8, 40);
		score += requiredTechCount * 5;
		factors.push(`${techReqCount} technical requirements`);
	}

	// UI complexity
	const uiReqCount = specification.uiRequirements.length;
	if (uiReqCount > 0) {
		score += Math.min(uiReqCount * 6, 30);
		factors.push(`${uiReqCount} UI requirements`);
	}

	// Constraint complexity
	const constraintCount = specification.constraints.length;
	if (constraintCount > 0) {
		score += Math.min(constraintCount * 5, 25);
		factors.push(`${constraintCount} constraints`);
	}

	// Description complexity
	if (specification.description) {
		const descriptionWords = specification.description.split(/\s+/).length;
		score += Math.min(descriptionWords * 0.5, 20);
		if (descriptionWords > 50) {
			factors.push("detailed description");
		}
	}

	// Determine complexity level
	let level: "simple" | "moderate" | "complex" | "very_complex";
	if (score <= 30) {
		level = "simple";
	} else if (score <= 60) {
		level = "moderate";
	} else if (score <= 100) {
		level = "complex";
	} else {
		level = "very_complex";
	}

	return {
		level,
		score,
		factors,
	};
}

/**
 * Generates recommendations for improving a specification
 */
export function generateRecommendations(
	specification: Specification,
): string[] {
	const recommendations: string[] = [];
	const validation = validateSpecification(specification);
	const complexity = estimateComplexity(specification);

	// Add validation-based recommendations
	recommendations.push(...validation.suggestions);

	// Add complexity-based recommendations
	if (complexity.level === "simple") {
		recommendations.push(
			"Consider adding more technical details to get a more comprehensive solution",
		);
	} else if (complexity.level === "very_complex") {
		recommendations.push(
			"Consider breaking down complex features into smaller, more manageable requirements",
		);
	}

	// Feature-specific recommendations
	if (specification.features.length > 0) {
		const featuresWithoutPriority = specification.features.filter(
			(f) => !f.priority || f.priority === "medium",
		);
		if (featuresWithoutPriority.length > specification.features.length * 0.5) {
			recommendations.push(
				"Consider setting clear priorities for your features",
			);
		}
	}

	// Technical requirement recommendations
	const hasFramework = specification.technicalRequirements.some(
		(req) => req.category === "framework",
	);
	const hasDatabase = specification.technicalRequirements.some(
		(req) => req.category === "database",
	);

	if (specification.features.length > 0 && !hasFramework) {
		recommendations.push(
			"Consider specifying a preferred framework or technology stack",
		);
	}

	if (specification.features.length > 0 && !hasDatabase) {
		recommendations.push(
			"Consider specifying database requirements if data persistence is needed",
		);
	}

	// Remove duplicates
	return Array.from(new Set(recommendations));
}
