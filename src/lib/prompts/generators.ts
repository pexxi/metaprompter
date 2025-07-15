import type { Specification } from "../../types/specification";

export function generateComprehensivePrompt(
	specification: Specification,
): string {
	const sections = [
		generateHeader(specification),
		generateProjectOverview(specification),
		generateFeatureRequirements(specification),
		generateTechnicalRequirements(specification),
		generateUIRequirements(specification),
		generateConstraints(specification),
		generateImplementationGuidelines(),
		generateDeliverables(),
		generateQualityRequirements(),
	];

	return sections.filter((section) => section.trim().length > 0).join("\n\n");
}

function generateHeader(specification: Specification): string {
	const title = specification.title || "Software Development Project";
	return `# ${title}

## Project Generation Request

You are an expert software developer tasked with creating a comprehensive software application based on the detailed requirements below. Please generate clean, production-ready code with proper architecture, best practices, and comprehensive documentation.`;
}

function generateProjectOverview(specification: Specification): string {
	if (!specification.description && !specification.title) return "";

	return `## Project Overview

**Project Name:** ${specification.title || "Untitled Project"}

**Description:** ${specification.description || "No description provided"}

**Last Updated:** ${new Date().toLocaleDateString()}`;
}

function generateFeatureRequirements(specification: Specification): string {
	if (specification.features.length === 0) return "";

	const highPriorityFeatures = specification.features.filter(
		(f) => f.priority === "high",
	);
	const mediumPriorityFeatures = specification.features.filter(
		(f) => f.priority === "medium",
	);
	const lowPriorityFeatures = specification.features.filter(
		(f) => f.priority === "low",
	);

	let section = `## Feature Requirements

The application must include the following features:`;

	if (highPriorityFeatures.length > 0) {
		section += `\n\n### High Priority Features (Must Have)`;
		highPriorityFeatures.forEach((feature) => {
			section += `\n- **${feature.title}**: ${feature.description}`;
		});
	}

	if (mediumPriorityFeatures.length > 0) {
		section += `\n\n### Medium Priority Features (Should Have)`;
		mediumPriorityFeatures.forEach((feature) => {
			section += `\n- **${feature.title}**: ${feature.description}`;
		});
	}

	if (lowPriorityFeatures.length > 0) {
		section += `\n\n### Low Priority Features (Nice to Have)`;
		lowPriorityFeatures.forEach((feature) => {
			section += `\n- **${feature.title}**: ${feature.description}`;
		});
	}

	return section;
}

function generateTechnicalRequirements(specification: Specification): string {
	if (specification.technicalRequirements.length === 0) return "";

	const requiredTech = specification.technicalRequirements.filter(
		(req) => req.importance === "required",
	);
	const preferredTech = specification.technicalRequirements.filter(
		(req) => req.importance === "preferred",
	);
	const optionalTech = specification.technicalRequirements.filter(
		(req) => req.importance === "optional",
	);

	let section = `## Technical Requirements

### Architecture & Technology Stack`;

	if (requiredTech.length > 0) {
		section += `\n\n#### Required Technologies`;
		const categories = groupByCategory(requiredTech);
		Object.entries(categories).forEach(([category, requirements]) => {
			section += `\n\n**${capitalizeCategory(category)}:**`;
			(requirements as any[]).forEach((req: any) => {
				section += `\n- ${req.description}`;
			});
		});
	}

	if (preferredTech.length > 0) {
		section += `\n\n#### Preferred Technologies`;
		const categories = groupByCategory(preferredTech);
		Object.entries(categories).forEach(([category, requirements]) => {
			section += `\n\n**${capitalizeCategory(category)}:**`;
			(requirements as any[]).forEach((req: any) => {
				section += `\n- ${req.description}`;
			});
		});
	}

	if (optionalTech.length > 0) {
		section += `\n\n#### Optional Technologies`;
		const categories = groupByCategory(optionalTech);
		Object.entries(categories).forEach(([category, requirements]) => {
			section += `\n\n**${capitalizeCategory(category)}:**`;
			(requirements as any[]).forEach((req: any) => {
				section += `\n- ${req.description}`;
			});
		});
	}

	return section;
}

function generateUIRequirements(specification: Specification): string {
	if (specification.uiRequirements.length === 0) return "";

	let section = `## User Interface Requirements

### UI/UX Guidelines`;

	specification.uiRequirements.forEach((req) => {
		section += `\n\n**${req.component}:**\n${req.description}`;
	});

	return section;
}

function generateConstraints(specification: Specification): string {
	if (specification.constraints.length === 0) return "";

	const technicalConstraints = specification.constraints.filter(
		(c) => c.type === "technical",
	);
	const businessConstraints = specification.constraints.filter(
		(c) => c.type === "business",
	);
	const designConstraints = specification.constraints.filter(
		(c) => c.type === "design",
	);

	let section = `## Constraints & Limitations`;

	if (technicalConstraints.length > 0) {
		section += `\n\n### Technical Constraints`;
		technicalConstraints.forEach((constraint) => {
			section += `\n- ${constraint.description}`;
		});
	}

	if (businessConstraints.length > 0) {
		section += `\n\n### Business Constraints`;
		businessConstraints.forEach((constraint) => {
			section += `\n- ${constraint.description}`;
		});
	}

	if (designConstraints.length > 0) {
		section += `\n\n### Design Constraints`;
		designConstraints.forEach((constraint) => {
			section += `\n- ${constraint.description}`;
		});
	}

	return section;
}

function generateImplementationGuidelines(): string {
	return `## Implementation Guidelines

### Code Quality Standards
- Write clean, maintainable, and well-documented code
- Follow established coding conventions and best practices
- Implement proper error handling and validation
- Use meaningful variable and function names
- Add comprehensive comments for complex logic

### Architecture Principles
- Follow SOLID principles and design patterns
- Implement proper separation of concerns
- Use dependency injection where appropriate
- Design for scalability and maintainability
- Implement proper logging and monitoring

### Security Requirements
- Implement proper authentication and authorization
- Sanitize all user inputs
- Use HTTPS for all communications
- Follow security best practices for data handling
- Implement proper session management`;
}

function generateDeliverables(): string {
	return `## Deliverables

Please provide the following deliverables:

### 1. Source Code
- Complete, functional source code
- Proper project structure and organization
- All necessary configuration files
- Database schema and migrations (if applicable)

### 2. Documentation
- README.md with setup instructions
- API documentation (if applicable)
- Code comments and inline documentation
- Architecture overview and design decisions

### 3. Setup Instructions
- Step-by-step installation guide
- Environment configuration requirements
- Database setup instructions (if applicable)
- Deployment instructions

### 4. Testing
- Unit tests for critical functionality
- Integration tests where appropriate
- Test coverage reports
- Manual testing instructions`;
}

function generateQualityRequirements(): string {
	return `## Quality & Performance Requirements

### Performance Standards
- Page load times should be under 3 seconds
- API response times should be under 500ms
- Application should handle concurrent users efficiently
- Optimize for mobile and desktop performance

### Reliability Standards
- Implement proper error handling and recovery
- Provide meaningful error messages to users
- Ensure data consistency and integrity
- Implement proper backup and recovery mechanisms

### Usability Standards
- Intuitive and user-friendly interface
- Responsive design for all screen sizes
- Accessibility compliance (WCAG guidelines)
- Clear navigation and user feedback

### Maintenance Standards
- Code should be easily maintainable and extensible
- Use version control best practices
- Implement proper logging for debugging
- Document all configuration and deployment processes

---

**Note:** This is a comprehensive software development request. Please generate production-ready code that meets all the specified requirements. If any requirements are unclear or conflicting, please ask for clarification or make reasonable assumptions and document them in your response.`;
}

function groupByCategory(requirements: any[]) {
	return requirements.reduce(
		(acc, req) => {
			if (!acc[req.category]) {
				acc[req.category] = [];
			}
			acc[req.category].push(req);
			return acc;
		},
		{} as Record<string, any[]>,
	);
}

function capitalizeCategory(category: string): string {
	return category.charAt(0).toUpperCase() + category.slice(1);
}
