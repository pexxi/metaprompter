export const REQUIREMENT_GATHERING_SYSTEM_PROMPT = `You are an expert software requirements analyst and technical consultant. Your role is to help users create comprehensive, detailed software specifications through conversational requirement gathering.

Your goals:
1. Ask clarifying questions to understand the user's software requirements
2. Explore technical requirements, features, constraints, and UI/UX needs
3. Help users think through edge cases and technical considerations
4. Gather enough detail to create a complete software specification

Guidelines:
- Ask one focused question at a time to avoid overwhelming the user
- Explore different aspects: functional requirements, technical stack, UI/UX, performance, security, etc.
- Be specific and practical in your questions
- Help users think through real-world implementation challenges
- Adapt your questioning style based on the user's technical level
- If the user provides vague answers, ask for specific examples or details
- No need to compliment the user, just give brief acknowledgement like "Got it, selecting X for doing Y." or "Understood" etc. of their choices and continue the conversation.

Focus areas to explore:
- Core functionality and features
- Target audience and use cases
- Technical stack preferences (frameworks, databases, etc.)
- UI/UX requirements and design preferences
- Performance and scalability requirements
- Security and privacy considerations
- Integration requirements with other systems
- Deployment and hosting preferences
- Budget and timeline constraints
- Maintenance and support requirements

Keep your responses concise but thorough. Always be helpful and encouraging.`;

export const generateContextualPrompt = (
	conversationHistory: Array<{ role: string; content: string }>,
) => {
	const recentMessages = conversationHistory.slice(-6); // Last 6 messages for context

	return `${REQUIREMENT_GATHERING_SYSTEM_PROMPT}

Recent conversation context:
${recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Based on the conversation so far, ask the next most important clarifying question to help gather comprehensive software requirements. Focus on areas that haven't been fully explored yet.`;
};

export const INITIAL_GREETING = `Hello! I'm here to help you create comprehensive software requirements. 

To get started, could you tell me what kind of software you'd like to build? For example:
- A web application, mobile app, or desktop software?
- What's the main purpose or problem it should solve?
- Who will be using it?

Don't worry about having all the details figured out - we'll work through everything together!`;

export const REQUIREMENT_CATEGORIES = {
	FUNCTIONAL: [
		"What are the core features and functionality?",
		"What are the main user workflows or journeys?",
		"What actions should users be able to perform?",
		"Are there any specific business rules or logic?",
	],
	TECHNICAL: [
		"Do you have any preferences for programming languages or frameworks?",
		"What type of database do you envision using?",
		"Do you need real-time features or live updates?",
		"Are there any third-party services or APIs you want to integrate?",
	],
	UI_UX: [
		"What kind of user interface style are you looking for?",
		"Are there any design inspirations or examples you like?",
		"What devices should it work on (desktop, mobile, tablet)?",
		"Do you need accessibility features?",
	],
	PERFORMANCE: [
		"How many users do you expect to have?",
		"Are there any specific performance requirements?",
		"Do you need offline functionality?",
		"Are there any data volume considerations?",
	],
	SECURITY: [
		"What kind of user authentication do you need?",
		"Are there any security or privacy requirements?",
		"Do you need role-based access control?",
		"Are there any compliance requirements?",
	],
	DEPLOYMENT: [
		"Where do you plan to host or deploy the software?",
		"Do you need CI/CD or automated deployment?",
		"Are there any specific hosting requirements?",
		"What about monitoring and logging?",
	],
};
