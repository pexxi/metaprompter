import type { Message } from "../../types/chat";
import type {
	Constraint,
	Feature,
	Specification,
	TechnicalRequirement,
	UIRequirement,
} from "../../types/specification";

export const SPECIFICATION_EXTRACTION_PROMPT = `You are an expert software requirements analyst. Your task is to analyze a conversation between a user and an AI assistant about software requirements and extract a comprehensive, structured specification.

Please analyze the conversation and extract the following information in a structured JSON format:

{
  "title": "Brief project title (infer from conversation)",
  "description": "2-3 sentence project description",
  "features": [
    {
      "id": "unique_id",
      "title": "Feature name",
      "description": "Detailed description",
      "priority": "high|medium|low"
    }
  ],
  "technicalRequirements": [
    {
      "id": "unique_id",
      "category": "framework|database|infrastructure|integration|security|performance",
      "description": "Requirement description",
      "importance": "required|preferred|optional"
    }
  ],
  "constraints": [
    {
      "id": "unique_id",
      "type": "technical|business|design",
      "description": "Constraint description"
    }
  ],
  "uiRequirements": [
    {
      "id": "unique_id",
      "component": "Component/screen name",
      "description": "UI requirement description"
    }
  ]
}

Guidelines:
- Extract only information that was explicitly mentioned or strongly implied in the conversation
- Prioritize features based on how much they were discussed or emphasized
- Include technical requirements even if they're preferences
- Don't invent requirements that weren't discussed
- Use descriptive IDs (e.g., "user_auth", "payment_processing")
- Be specific and actionable in descriptions

Return only the JSON object, no additional text.`;

export class SpecificationParser {
	static async parseConversation(
		messages: Message[],
		aiService: any, // ChatService
	): Promise<Partial<Specification>> {
		try {
			// Filter out system messages and create conversation context
			const conversationMessages = messages.filter(
				(msg) => msg.role === "user" || msg.role === "assistant",
			);

			// Create context for the AI
			const conversationContext = conversationMessages
				.map((msg) => `${msg.role}: ${msg.content}`)
				.join("\n\n");

			const prompt = `${SPECIFICATION_EXTRACTION_PROMPT}\n\nConversation to analyze:\n${conversationContext}`;

			// Get AI response
			const response = await aiService.sendMessage([
				{ role: "user", content: prompt, id: "parse", timestamp: new Date() },
			]);

			// Parse JSON response with better error handling
			const cleanResponse = response.trim();

			// Try to extract JSON from the response
			let jsonString = cleanResponse;

			// If response contains code blocks, extract from them
			const codeBlockMatch = cleanResponse.match(
				/```(?:json)?\s*([\s\S]*?)\s*```/,
			);
			if (codeBlockMatch) {
				jsonString = codeBlockMatch[1].trim();
			} else {
				// Try to find JSON object boundaries
				const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					jsonString = jsonMatch[0];
				}
			}

			// Clean up common JSON issues
			jsonString = jsonString
				.replace(/,\s*}/g, "}") // Remove trailing commas before closing braces
				.replace(/,\s*]/g, "]") // Remove trailing commas before closing brackets
				.replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
				.replace(/[\u2018\u2019]/g, "'"); // Replace smart apostrophes

			let parsedData;
			try {
				parsedData = JSON.parse(jsonString);
			} catch (parseError) {
				// If JSON parsing fails, try to fix common issues
				console.warn(
					"Initial JSON parse failed, attempting to fix:",
					parseError,
				);
				console.warn("Original JSON string:", jsonString);

				// Try to complete truncated JSON
				let fixedJson = jsonString;

				// Count open/close braces and brackets to see what's missing
				const openBraces = (fixedJson.match(/\{/g) || []).length;
				const closeBraces = (fixedJson.match(/\}/g) || []).length;
				const openBrackets = (fixedJson.match(/\[/g) || []).length;
				const closeBrackets = (fixedJson.match(/\]/g) || []).length;

				// Remove trailing comma if it exists
				fixedJson = fixedJson.replace(/,\s*$/, "");

				// Close any unclosed strings
				const quoteCount = (fixedJson.match(/"/g) || []).length;
				if (quoteCount % 2 !== 0) {
					fixedJson += '"';
				}

				// Close any unclosed arrays
				for (let i = 0; i < openBrackets - closeBrackets; i++) {
					fixedJson += "]";
				}

				// Close any unclosed objects
				for (let i = 0; i < openBraces - closeBraces; i++) {
					fixedJson += "}";
				}

				try {
					parsedData = JSON.parse(fixedJson);
					console.log("Successfully parsed fixed JSON");
				} catch (secondParseError) {
					console.error(
						"JSON parsing failed even after completion attempt:",
						secondParseError,
					);
					console.error("Attempted to parse:", fixedJson);

					// Last resort: try to parse just the beginning part that might be valid
					const firstBraceIndex = jsonString.indexOf("{");
					if (firstBraceIndex !== -1) {
						let partialJson = jsonString.substring(firstBraceIndex);

						// Find the first complete object by balancing braces
						let braceCount = 0;
						let endIndex = -1;
						for (let i = 0; i < partialJson.length; i++) {
							if (partialJson[i] === "{") braceCount++;
							else if (partialJson[i] === "}") braceCount--;

							if (braceCount === 0) {
								endIndex = i + 1;
								break;
							}
						}

						if (endIndex > 0) {
							partialJson = partialJson.substring(0, endIndex);
							try {
								parsedData = JSON.parse(partialJson);
								console.log("Successfully parsed partial JSON");
							} catch (thirdParseError) {
								throw new Error(
									`Failed to parse JSON after all attempts: ${thirdParseError instanceof Error ? thirdParseError.message : String(thirdParseError)}`,
								);
							}
						} else {
							throw new Error(
								`No valid JSON structure found in response: ${secondParseError instanceof Error ? secondParseError.message : String(secondParseError)}`,
							);
						}
					} else {
						throw new Error(
							`No valid JSON structure found in response: ${secondParseError instanceof Error ? secondParseError.message : String(secondParseError)}`,
						);
					}
				}
			}

			// Validate and transform the data
			return {
				title: parsedData.title || "",
				description: parsedData.description || "",
				features: SpecificationParser.validateFeatures(
					parsedData.features || [],
				),
				technicalRequirements:
					SpecificationParser.validateTechnicalRequirements(
						parsedData.technicalRequirements || [],
					),
				constraints: SpecificationParser.validateConstraints(
					parsedData.constraints || [],
				),
				uiRequirements: SpecificationParser.validateUIRequirements(
					parsedData.uiRequirements || [],
				),
			};
		} catch (error) {
			console.error("Error parsing conversation:", error);
			throw new Error("Failed to parse conversation into specification");
		}
	}

	private static validateFeatures(features: any[]): Feature[] {
		return features.map((feature) => ({
			id:
				feature.id ||
				`feature_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			title: feature.title || "Untitled Feature",
			description: feature.description || "",
			priority: ["high", "medium", "low"].includes(feature.priority)
				? feature.priority
				: "medium",
		}));
	}

	private static validateTechnicalRequirements(
		requirements: any[],
	): TechnicalRequirement[] {
		return requirements.map((req) => ({
			id:
				req.id ||
				`tech_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			category: req.category || "framework",
			description: req.description || "",
			importance: ["required", "preferred", "optional"].includes(req.importance)
				? req.importance
				: "preferred",
		}));
	}

	private static validateConstraints(constraints: any[]): Constraint[] {
		return constraints.map((constraint) => ({
			id:
				constraint.id ||
				`constraint_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			type: ["technical", "business", "design"].includes(constraint.type)
				? constraint.type
				: "business",
			description: constraint.description || "",
		}));
	}

	private static validateUIRequirements(requirements: any[]): UIRequirement[] {
		return requirements.map((req) => ({
			id:
				req.id || `ui_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
			component: req.component || "Component",
			description: req.description || "",
		}));
	}
}
