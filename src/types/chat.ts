export interface Message {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	isError?: boolean;
}

export interface Conversation {
	id: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
}
