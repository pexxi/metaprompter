import type { Specification } from "../../types/specification";
import type { Conversation } from "../../types/chat";
import type { Message } from "../../types/chat";
import { ChatService } from "./chat-service";

export interface PromptGenerationContext {
	specification: Specification;
	conversation?: Conversation;
	targetPlatform?: "lovable" | "v0" | "replit" | "general";
}

export class PromptGenerationService {
	private chatService: ChatService;

	constructor(chatService: ChatService) {
		this.chatService = chatService;
	}

	async generateComprehensivePrompt(
		context: PromptGenerationContext,
	): Promise<string> {
		const systemPrompt = this.createSystemPrompt(context);
		const userPrompt = this.createUserPrompt(context);

		const messages: Message[] = [
			{ id: "system", role: "system", content: systemPrompt, timestamp: new Date() },
			{ id: "user", role: "user", content: userPrompt, timestamp: new Date() },
		];

		return await this.chatService.sendMessage(messages);
	}

	async generateComprehensivePromptStream(
		context: PromptGenerationContext,
		onChunk: (chunk: string) => void,
	): Promise<string> {
		const systemPrompt = this.createSystemPrompt(context);
		const userPrompt = this.createUserPrompt(context);

		const messages: Message[] = [
			{ id: "system", role: "system", content: systemPrompt, timestamp: new Date() },
			{ id: "user", role: "user", content: userPrompt, timestamp: new Date() },
		];

		return await this.chatService.sendMessageStream(messages, onChunk);
	}

	private createSystemPrompt(context: PromptGenerationContext): string {
		const platform = context.targetPlatform || "general";
		
		return `You are an expert software architect and prompt engineer specializing in creating comprehensive, single-shot prompts for AI-powered development platforms like Lovable, v0, Replit, and others.

Your task is to create a complete, production-ready prompt that will generate a fully functional application in ONE interaction. The prompt must be self-contained with all necessary information for the AI to build the entire application.

## Platform-Specific Optimization

${this.getPlatformGuidelines(platform)}

## Core Requirements for Generated Prompts

### 1. Architecture & Technical Guidelines
- Analyze the requirements and determine the optimal tech stack
- Provide specific architecture recommendations based on the project complexity
- Include performance, security, and scalability considerations
- Specify database schema and data models if needed

### 2. Implementation Strategy
- Create a step-by-step implementation plan
- Break down the project into logical phases
- Prioritize features based on dependencies and importance
- Include specific file structure and component organization

### 3. Code Quality Standards
- Specify coding standards and best practices
- Include error handling and validation requirements
- Define testing strategy and coverage expectations
- Specify documentation requirements

### 4. User Experience Design
- Provide detailed UI/UX guidelines
- Include responsive design requirements
- Specify accessibility standards
- Define user interaction patterns

### 5. Platform Compatibility
- Ensure the prompt works optimally with the target platform
- Use platform-specific terminology and patterns
- Include platform-specific optimization techniques
- Consider platform limitations and capabilities

## Output Format

Generate a comprehensive prompt that includes:
1. **Project Overview** - Clear description and goals
2. **Technical Architecture** - Stack, patterns, and structure
3. **Implementation Plan** - Step-by-step development approach
4. **Feature Specifications** - Detailed requirements for each feature
5. **Design Guidelines** - UI/UX requirements and standards
6. **Quality Requirements** - Testing, performance, and security standards
7. **Deliverables** - Specific outputs expected from the AI

The prompt should be detailed enough that another AI can build the entire application without additional clarification.`;
	}

	private getPlatformGuidelines(platform: string): string {
		switch (platform) {
			case "lovable":
				return `**Lovable Platform Guidelines:**
- Focus on React/TypeScript with modern practices
- Emphasize component-based architecture
- Include Tailwind CSS for styling
- Specify database models and API endpoints clearly
- Include real-time features and state management
- Emphasize user authentication and data persistence
- Use shadcn/ui components where appropriate`;

			case "v0":
				return `**v0 Platform Guidelines:**
- Optimize for React with Next.js when appropriate
- Focus on component composition and reusability
- Include specific UI component requirements
- Emphasize responsive design with Tailwind CSS
- Specify exact component behavior and interactions
- Include data fetching and state management patterns
- Focus on modern React patterns (hooks, context, etc.)`;

			case "replit":
				return `**Replit Platform Guidelines:**
- Support multiple programming languages as needed
- Include complete project setup and configuration
- Specify package dependencies and installation
- Include environment configuration and secrets
- Focus on educational and collaborative features
- Ensure code is well-commented and documented
- Include testing and debugging approaches`;

			default:
				return `**General Platform Guidelines:**
- Create platform-agnostic, comprehensive specifications
- Include multiple technology stack options
- Provide clear setup and deployment instructions
- Focus on best practices and industry standards
- Ensure compatibility with common development environments
- Include comprehensive documentation and examples`;
		}
	}

	private createUserPrompt(context: PromptGenerationContext): string {
		const { specification, conversation, targetPlatform } = context;

		let prompt = `Create a comprehensive software development prompt based on the following requirements:

## Project Information
**Title:** ${specification.title || "Software Application"}
**Description:** ${specification.description || "No description provided"}
**Target Platform:** ${targetPlatform || "general"}
**Last Updated:** ${new Date().toLocaleDateString()}

`;

		// Add features section
		if (specification.features.length > 0) {
			prompt += `## Features Required\n\n`;
			
			const featuresByPriority = {
				high: specification.features.filter(f => f.priority === "high"),
				medium: specification.features.filter(f => f.priority === "medium"),
				low: specification.features.filter(f => f.priority === "low"),
			};

			if (featuresByPriority.high.length > 0) {
				prompt += `### High Priority Features (Must Have)\n`;
				featuresByPriority.high.forEach(feature => {
					prompt += `- **${feature.title}**: ${feature.description}\n`;
				});
				prompt += `\n`;
			}

			if (featuresByPriority.medium.length > 0) {
				prompt += `### Medium Priority Features (Should Have)\n`;
				featuresByPriority.medium.forEach(feature => {
					prompt += `- **${feature.title}**: ${feature.description}\n`;
				});
				prompt += `\n`;
			}

			if (featuresByPriority.low.length > 0) {
				prompt += `### Low Priority Features (Nice to Have)\n`;
				featuresByPriority.low.forEach(feature => {
					prompt += `- **${feature.title}**: ${feature.description}\n`;
				});
				prompt += `\n`;
			}
		}

		// Add technical requirements
		if (specification.technicalRequirements.length > 0) {
			prompt += `## Technical Requirements\n\n`;
			
			const techByImportance = {
				required: specification.technicalRequirements.filter(t => t.importance === "required"),
				preferred: specification.technicalRequirements.filter(t => t.importance === "preferred"),
				optional: specification.technicalRequirements.filter(t => t.importance === "optional"),
			};

			if (techByImportance.required.length > 0) {
				prompt += `### Required Technologies\n`;
				techByImportance.required.forEach(tech => {
					prompt += `- **${tech.category}**: ${tech.description}\n`;
				});
				prompt += `\n`;
			}

			if (techByImportance.preferred.length > 0) {
				prompt += `### Preferred Technologies\n`;
				techByImportance.preferred.forEach(tech => {
					prompt += `- **${tech.category}**: ${tech.description}\n`;
				});
				prompt += `\n`;
			}

			if (techByImportance.optional.length > 0) {
				prompt += `### Optional Technologies\n`;
				techByImportance.optional.forEach(tech => {
					prompt += `- **${tech.category}**: ${tech.description}\n`;
				});
				prompt += `\n`;
			}
		}

		// Add UI requirements
		if (specification.uiRequirements.length > 0) {
			prompt += `## UI/UX Requirements\n\n`;
			specification.uiRequirements.forEach(ui => {
				prompt += `### ${ui.component}\n${ui.description}\n\n`;
			});
		}

		// Add constraints
		if (specification.constraints.length > 0) {
			prompt += `## Constraints and Limitations\n\n`;
			
			const constraintsByType = {
				technical: specification.constraints.filter(c => c.type === "technical"),
				business: specification.constraints.filter(c => c.type === "business"),
				design: specification.constraints.filter(c => c.type === "design"),
			};

			if (constraintsByType.technical.length > 0) {
				prompt += `### Technical Constraints\n`;
				constraintsByType.technical.forEach(constraint => {
					prompt += `- ${constraint.description}\n`;
				});
				prompt += `\n`;
			}

			if (constraintsByType.business.length > 0) {
				prompt += `### Business Constraints\n`;
				constraintsByType.business.forEach(constraint => {
					prompt += `- ${constraint.description}\n`;
				});
				prompt += `\n`;
			}

			if (constraintsByType.design.length > 0) {
				prompt += `### Design Constraints\n`;
				constraintsByType.design.forEach(constraint => {
					prompt += `- ${constraint.description}\n`;
				});
				prompt += `\n`;
			}
		}

		// Add conversation context if available
		if (conversation && conversation.messages.length > 0) {
			prompt += `## Additional Context from Conversation\n\n`;
			prompt += `The following conversation led to these requirements. Use this context to better understand the user's intent and any nuances:\n\n`;
			
			// Include recent messages for context (last 10 messages)
			const recentMessages = conversation.messages
				.filter((msg: Message) => msg.role !== "system")
				.slice(-10);
			
			recentMessages.forEach((msg: Message) => {
				const roleName = msg.role === "user" ? "User" : msg.role === "assistant" ? "Assistant" : "System";
				prompt += `**${roleName}**: ${msg.content}\n\n`;
			});
		}

		prompt += `## Instructions

Based on the above requirements, create a comprehensive, single-shot prompt that will generate a complete, production-ready application. The prompt should include:

1. **Clear project overview and goals**
2. **Detailed technical architecture recommendations**
3. **Step-by-step implementation plan**
4. **Comprehensive feature specifications**
5. **UI/UX design guidelines**
6. **Quality and performance requirements**
7. **Testing and deployment instructions**

The generated prompt should be self-contained and detailed enough that an AI can build the entire application without additional clarification or follow-up questions.`;

		return prompt;
	}
}