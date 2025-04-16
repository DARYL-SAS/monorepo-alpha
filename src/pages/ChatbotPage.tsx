import { useState } from 'react';

interface ChatbotQueryInput {
    prompt: string;
}

interface ChatbotQueryResponse {
    response: string;
    sources: string[];
    conversationId: string;
}

const ChatbotPage = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<ChatbotQueryResponse | null>(null);
    const [loading, setLoading] = useState(false);


const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
        const res = await fetch("/chatbot/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt } as ChatbotQueryInput),
        });

        if (!res.ok) {
            const text = await res.text(); // on récupère le texte brut en cas d'erreur
            console.error("Error response:", res.status, text);
            throw new Error(`Erreur ${res.status}: ${text}`); // on lance une erreur avec le texte brut
        }

        const data: ChatbotQueryResponse = await res.json();
        setResponse(data);
    } catch (error) {
        console.error("Error fetching chatbot response:", error);
    } finally {
        setLoading(false);
    }
};

return (
    <div>
        <h1>Chatbot</h1>
        <form onSubmit={handleSubmit}>
            <textarea
                rows={4}
                placeholder="Pose ta question..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Chargement..." : "Envoyer"}
            </button>
        </form>

        {response && (
            <div>
                <p><strong>Réponse :</strong>{response.response}</p>
                <p><strong>Sources :</strong></p>
                <ul>
                    {response.sources.map((src, idx) => (
                        <li key={idx}>{src}</li>
                    ))}
                </ul>
                <p>ID de conversation : {response.conversationId}</p>
            </div>
        )}
    </div>
)}

export default ChatbotPage;
// src/pages/ChatbotPage.tsx