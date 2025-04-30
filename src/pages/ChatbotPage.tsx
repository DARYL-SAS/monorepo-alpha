import React, { useEffect, useRef, useState } from 'react';
import { ChatbotQueryInput, ChatbotQueryResponse } from '../types/chatbot.ts';
import {SendHorizontal} from 'lucide-react';

const ChatbotPage = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<ChatbotQueryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ type: "user" | "bot"; content: string }[]>([]);
    const [hasFocusedOnce, setHasFocusedOnce] = useState(false); // Pour éviter le focus immédiat sur le textarea

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Scroll automatique dans la boîte de messages
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);


    useEffect(() => {
        // Focus sur le textarea après le premier message
        if (hasFocusedOnce) {
            textareaRef.current?.focus();
        }
    }, [messages]);
    


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || loading) return;

        const userMessage = { type: "user" as const, content: prompt };
        const typingIndicator = { type: "bot" as const, content: "..." };

        setMessages((prev) => [...prev, userMessage, typingIndicator]);
        setLoading(true);
        setPrompt('');

        textareaRef.current?.focus();

        try {
            const res = await fetch("/chatbot/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt } as ChatbotQueryInput),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Error response:", res.status, text);
                throw new Error(`Erreur ${res.status}: ${text}`);
            }

            const data: ChatbotQueryResponse = await res.json();

            // Remplace le "..." par la vraie réponse
            setMessages((prev) => [
                ...prev.slice(0, -1), // retire "..."
                { type: 'bot', content: data.response },
            ]);

            setResponse(data);
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { type: 'bot', content: "Une erreur est survenue." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className='w-full flex flex-col items-center justify-center pb-4 px-6 min-h-screen bg-gray-50'>
            <div 
                className="w-full h-[80vh] flex flex-col"
                onClick={() => {
                    if (!hasFocusedOnce) setHasFocusedOnce(true);
                    textareaRef.current?.focus();
                }}
                >

                {/* Boîte de messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto mb-4 px-4 py-4 space-y-4"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.type === "user" ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs p-3 rounded-lg ${
                                    msg.type === 'user' 
                                        ? 'bg-indigo-500 text-gray-100' 
                                        : msg.content === "..." 
                                            ? 'bg-gray-200 text-gray-700 animate-pulse' 
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {msg.content === "..." ? "Le bot est en train de répondre..." : msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Formulaire d'envoi de message */}
                <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
                    <div className="relative w-full flex items-center">
                        <textarea
                        ref={textareaRef}
                            rows={1}
                            placeholder="Poser une question..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                if (hasFocusedOnce) {
                                    setTimeout(() => {
                                        textareaRef.current?.focus();
                                    }, 0);
                                }
                            }}
                            disabled={loading}
                            className="w-full pb-6 p-4 pr-16 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-800 resize-none overflow-hidden disabled:opacity-50"
                        
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="absolute right-2 py-1 px-3 text-indigo-600 font-semibold 
                                disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                        >
                        <SendHorizontal className="inline-block" />     
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
    )
}

export default ChatbotPage;
