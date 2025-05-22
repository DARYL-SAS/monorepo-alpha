import React, { useEffect, useRef, useState } from 'react';
import { SendHorizontal, Eye, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ButtonHub from '@components/ButtonHub';

// -----------------------------------------------------------------------------
// Config ----------------------------------------------------------------------
// -----------------------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// -----------------------------------------------------------------------------
// Types -----------------------------------------------------------------------
// -----------------------------------------------------------------------------
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotQueryInput {
  human_query: string;
  conversation_history: ConversationMessage[];
  /** turns streaming mode on */
  stream?: boolean;
  /** base64‑encoded image without the data URI prefix */
  image_base64?: string;
}

export interface VectorHit {
  text: string;
  score?: number;
  metadata?: { page?: number; source?: string };
}

export interface KagEntry {
  result: string | VectorHit[];
  type_kag: string; // "graph" | "vector" | ...
}

export interface ChatbotQueryResponse {
  answer: string;
  enhanced_query: string;
  context_aggregator: KagEntry[];
}

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  image?: string; // base64 data‑url preview for user, or remote URL for bot
  enhanced_query?: string;
  context_aggregator?: KagEntry[];
}

interface StreamChunk {
  answer?: string; // partial text
  finish_reason?: string; // "stop" when generation is complete
}

// -----------------------------------------------------------------------------
// Markdown helper -------------------------------------------------------------
// -----------------------------------------------------------------------------
const MarkdownBlock: React.FC<{ children: string }> = ({ children }) => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
        p: ({ node, ...props }) => <p className="whitespace-pre-line mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        code: ({ node, ...props }) =>
          
            <pre className="bg-gray-100 p-3 rounded overflow-auto my-2">
              <code className="text-sm font-mono" {...props} />
            </pre>
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

// -----------------------------------------------------------------------------
// Component -------------------------------------------------------------------
// -----------------------------------------------------------------------------
const ChatbotPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasFocusedOnce, setHasFocusedOnce] = useState(false);
  const [detailMessage, setDetailMessage] = useState<ChatMessage | null>(null);

  // image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // Effects -------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (hasFocusedOnce) textareaRef.current?.focus();
  }, [messages, hasFocusedOnce]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailMessage(null);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const TypingDots: React.FC = () => (
    <span className="inline-block gap-1">
      <span className="dot bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></span>
      <span className="dot bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      <span className="dot bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      <style>
        {`
        .dot {
          display: inline-block;
          width: 0.1em;
          height: 0.1em;
          border-radius: 50%;
          font-size: 2em;
          line-height: 0.5em;
          margin: 0 0.1em;
          vertical-align: middle;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-0.2em); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
          animation-delay: 0.4s;
        }
      `}
      </style>
    </span>
  )

  // ---------------------------------------------------------------------------
  // Helpers -------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  /** Append a token to the last bot message */
  const pushToken = (token: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.type !== 'bot') return prev;
      const updated = { ...last, content: last.content + token } as ChatMessage;
      return [...prev.slice(0, -1), updated];
    });
  };

  /** Replace typing placeholder with a fresh empty bot bubble */
  const switchToStreaming = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const withoutTyping = prev.slice(0, -1);
      const streamMsg: ChatMessage = { type: 'bot', content: '' };
      return [...withoutTyping, streamMsg];
    });
  };

  /** Read a File object as base64 */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip data URI prefix → we only want pure base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // ---------------------------------------------------------------------------
  // API -----------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const sendQuery = async (query: string) => {
    // Cancel any on‑going stream so the UI won't overlap
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build conversation history excluding the typing placeholder
    const history: ConversationMessage[] = [
      ...messages
        .filter((m) => m.type !== 'bot' || m.content !== '...')
        .map((m) => ({
          role: m.type === 'user' ? 'user' as 'user' : 'assistant' as 'assistant',
          content: m.content,
        })),
      { role: 'user', content: query },
    ];

    // Prepare base64 image if any
    let imageBase64: string | undefined;
    if (selectedImage) {
      try {
        imageBase64 = await fileToBase64(selectedImage);
      } catch (_) {
        console.warn('Unable to read image');
      }
    }

    // Optimistic UI update -----------------------------------------------------
    const userMsg: ChatMessage = {
      type: 'user',
      content: query || (imagePreview ? '(image)' : ''),
      image: imagePreview || undefined,
    };
    const typing: ChatMessage = { type: 'bot', content: '...' }; // placeholder
    setMessages((prev) => [...prev, userMsg, typing]);
    setLoading(true);
    setPrompt('');
    setSelectedImage(null);
    setImagePreview(null);

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          human_query: query,
          conversation_history: history,
          stream: true,
          image: imageBase64,
        } as ChatbotQueryInput),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Erreur réseau');

      // Activate streaming mode (replace typing bubble)
      switchToStreaming();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Split by object boundaries: `}{` → add delimiter that ensures valid JSON
        // This works because backend sends `{...}{...}` with no delimiter
        const parts = buffer.replace(/}{/g, '}\u001e{').split('\u001e');

        // Keep last chunk in buffer if it's incomplete
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          let chunk: StreamChunk | null = null;
          try {
            chunk = JSON.parse(part);
          } catch (_) {
            // Should not happen as we inserted delimiter only on perfect boundaries
          }
          if (!chunk) continue;

          if (chunk.answer) pushToken(chunk.answer);
          if (chunk.finish_reason === 'stop') reader.cancel();
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: 'Une erreur est survenue.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers ------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !imagePreview) || loading) return;
    sendQuery(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleQuickButton = (text: string) => {
    setPrompt(text);
    textareaRef.current?.focus();
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // ---------------------------------------------------------------------------
  // Detail modal --------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const renderVectorHit = (hit: VectorHit, i: number) => (
    <li key={i} className="space-y-1">
      {hit.metadata?.source && (
        <p className="text-xs text-gray-500">
          Source : {hit.metadata.source}
          {hit.metadata.page && `, p.${hit.metadata.page}`}
        </p>
      )}
      {hit.score !== undefined && (
        <p className="text-xs italic text-gray-400">Score {hit.score.toFixed(3)}</p>
      )}
      <p className="whitespace-pre-wrap text-sm">{hit.text.slice(0, 400)}…</p>
    </li>
  );

  const DetailModal = () => (
    <AnimatePresence>
      {detailMessage && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDetailMessage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-white max-w-2xl w-full rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold">Détails de la réponse</h4>
              <button className="text-gray-500 hover:text-gray-800" onClick={() => setDetailMessage(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              {detailMessage.enhanced_query && (
                <div>
                  <p className="font-semibold mb-1">Enhanced query</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{detailMessage.enhanced_query}</p>
                </div>
              )}

              {detailMessage.context_aggregator?.map((entry, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="font-semibold">
                    {entry.type_kag === 'vector' ? 'Recherche vectorielle' : 'Graphe de connaissances'}
                  </p>
                  {typeof entry.result === 'string' ? (
                    <MarkdownBlock>{entry.result}</MarkdownBlock>
                  ) : Array.isArray(entry.result) ? (
                    <ul className="list-decimal pl-4 space-y-3">{entry.result.slice(0, 5).map(renderVectorHit)}</ul>
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ---------------------------------------------------------------------------
  // Main JSX ------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full flex flex-col items-center justify-center h-screen bg-gray-100 pb-4 px-6">
      {/* Detail modal */}
      <DetailModal />

      {/* Chat container */}
      <div
        className="w-full h-[80vh] flex flex-col"
        onClick={() => {
          if (!hasFocusedOnce) setHasFocusedOnce(true);
          textareaRef.current?.focus();
        }}
      >
        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center text-center text-gray-500 h-full"
              >
                <h2 className="text-2xl font-semibold mb-4">Bonjour je suis Daryl,</h2>
                <h3 className="text-lg mb-4">Comment puis-je vous aider ?</h3>

                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <ButtonHub configKey="chiffrage" onButtonClick={handleQuickButton} />
                  <ButtonHub configKey="produits" onButtonClick={handleQuickButton} />
                  <ButtonHub configKey="conseils" onButtonClick={handleQuickButton} />
                </div>
              </motion.div>
            ) : ( 
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[60%] p-3 rounded-lg break-words whitespace-pre-wrap ${
    msg.type === 'user'
                          ? 'bg-indigo-700 text-indigo-100'
                          : msg.content === '...'
                          ? 'bg-gray-200 text-gray-700 animate-pulse'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {/* Image if present */}
                      {msg.image && (
                        <img src={msg.image} alt="envoyé" className="max-w-full max-h-60 rounded-lg mb-2" />
                      )}

                      {msg.content === ''
                        ? 'Daryl est en train de répondre...'
                        : msg.content === '...'
                        ? <TypingDots />
                        : msg.type === 'bot'
                        ? <MarkdownBlock>{msg.content}</MarkdownBlock>
                        : msg.content}

                      {msg.type === 'bot' && msg.content !== '...' && (msg.enhanced_query || msg.context_aggregator) && (
                        <button className="flex items-center gap-1 mt-2 text-sm text-indigo-600" onClick={() => setDetailMessage(msg)}>
                          Consulter les détails <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2 w-full mt-2">
          {/* image preview */}
          {imagePreview && (
            <div className="relative inline-block self-start">
              <img src={imagePreview} alt="preview" className="h-20 rounded-lg shadow" />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-white/80 backdrop-blur rounded-full p-1 text-gray-700 hover:text-red-600"
                onClick={clearSelectedImage}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="relative w-full flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Poser une question..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full pb-6 p-4 pr-28 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-800 resize-none overflow-hidden disabled:opacity-50"
            />

            {/* image upload icon */}
            <button
              type="button"
              onClick={handleImageButtonClick}
              className="absolute right-16 py-1 px-2 text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
              disabled={loading}
            >
              <ImageIcon className="inline-block" />
            </button>

            {/* send icon */}
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 py-1 px-3 text-indigo-600 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              <SendHorizontal className="inline-block" />
            </button>

            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
