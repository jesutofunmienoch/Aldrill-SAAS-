'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

const Trending = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!data.reply) {
        throw new Error('No reply from API');
      }

      const botReply: Message = { sender: 'bot', content: data.reply };
      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', content: '⚠️ Oops! Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-semibold">Aldrill AI 🚀 Assistant</h1>
        <img src="/images/chatbot.png" alt="Menu" className="h-12 w-14 rounded-[5px]" />
      </div>

      <div className="flex-1 overflow-hidden p-4 relative bg-muted">
        {messages.length === 0 && !loading ? (
          <div className="absolute top-0 left-0 right-0 bottom-20 flex flex-col items-center justify-center text-center px-4">
            <img src="/images/chatbot.png" alt="Chat AI" className="w-22 h-16 mb-4 object-cover rounded-[9px]" />
            <h2 className="text-xl font-semibold">💬 Chat with Aldrill AI</h2>
            <p className="text-muted-foreground mb-6">🚀 An AI Created By ENOCH powerful language model</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl w-full">
              {['🧠 Explain quantum computing', '📖 Write a creative story', '💻 Help me code a function'].map((example, i) => (
                <div
                  key={i}
                  className="bg-white text-black p-4 rounded-xl shadow-sm text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => setInput(example)}
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto h-full pb-24 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-2 items-start',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'p-3 max-w-xs md:max-w-md lg:max-w-lg rounded-xl text-sm whitespace-pre-wrap',
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-black rounded-bl-none shadow-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white text-black rounded-xl rounded-bl-none shadow-sm text-sm flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="fixed bottom-0 w-full max-w-4xl mx-auto left-0 right-0 p-4 border-t flex items-center gap-2 bg-white"
      >
        <textarea
          rows={1}
          className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="💬 Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-primary rounded-md text-white hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Trending;
