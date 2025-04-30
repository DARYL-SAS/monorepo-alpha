interface ChatbotQueryInput {
    prompt: string;
}

interface ChatbotQueryResponse {
    response: string;
    sources: string[];
    conversationId: string;
}