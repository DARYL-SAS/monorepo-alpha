export interface ChatbotQueryInput {
    prompt: string;
}

export interface ChatbotQueryResponse {
    response: string;
    sources: string[];
    conversationId: string;
}