'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus, Trash, Pencil, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

const Trending = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<{ id: string; title: string; messages: Message[] }[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [justOpened, setJustOpened] = useState(true);

  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistories');
    const storedCurrentId = localStorage.getItem('currentChatId');
    if (storedChats) setChatHistories(JSON.parse(storedChats));
    if (storedCurrentId) setCurrentChatId(storedCurrentId);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    localStorage.setItem('currentChatId', currentChatId);
  }, [chatHistories, currentChatId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length > 0 && !currentChatId) {
      const title = messages[0].content.split(' ').slice(0, 5).join(' ') + '...';
      const id = String(new Date().getTime());
      const updatedHistories = [...chatHistories, { id, title, messages }];
      setChatHistories(updatedHistories);
      setCurrentChatId(id);
    } else if (currentChatId) {
      setChatHistories((prev) =>
        prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages } : chat))
      );
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setJustOpened(false);

    const userMessage: Message = { sender: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!data.reply) throw new Error('No reply from API');

      const reply = data.reply;
      let index = 0;

      setMessages((prev) => [...prev, { sender: 'bot', content: '' }]);

      const interval = setInterval(() => {
        index++;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            sender: 'bot',
            content: reply.slice(0, index),
          };
          return updated;
        });

        if (index >= reply.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 20);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', content: '⚠️ Oops! Something went wrong. Please try again.' },
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId('');
    setJustOpened(true);
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistories.filter((chat) => chat.id !== id);
    setChatHistories(updated);
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleRenameChat = (id: string) => {
    const newTitle = prompt('Enter new chat title:');
    if (newTitle) {
      setChatHistories((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat))
      );
    }
  };

  const handleSelectChat = (id: string) => {
    const chat = chatHistories.find((chat) => chat.id === id);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setJustOpened(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen w-full flex bg-white text-black overflow-hidden relative">
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: orange;
          border-radius: 3px;
        }
      `}</style>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 sm:hidden cursor-pointer" />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed sm:static top-0 left-0 z-50 sm:z-0 h-full sm:flex w-[260px] border-r bg-white px-4 pt-4 pb-2 flex-col gap-4 transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      )}>
        <button className="sm:hidden mb-2 text-black flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
          <img src="/images/close.jpeg" alt="Close" className="w-5 h-5" />
          <span>Close</span>
        </button>
        <button onClick={handleNewChat} className="flex items-center gap-2 p-2 bg-primary text-white rounded hover:bg-primary/90">
          <Plus size={16} /> New Chat
        </button>
        <div className="relative mt-1 mb-3">
          <Search className="absolute left-2 top-2.5 text-gray-500" size={16} />
          <input type="text" placeholder="Search chats" className="w-full pl-8 pr-2 py-2 border rounded text-sm focus:outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {chatHistories.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between p-2 bg-muted hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleSelectChat(chat.id)}>
              <span className="text-sm truncate w-40" title={chat.title}>{chat.title}</span>
              <div className="flex items-center gap-1">
                <Pencil size={14} className="text-gray-500 hover:text-black cursor-pointer" onClick={() => handleRenameChat(chat.id)} />
                <Trash size={14} className="text-gray-500 hover:text-red-600 cursor-pointer" onClick={() => handleDeleteChat(chat.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 relative bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="sm:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu />
            </button>
            <h1 className="text-lg font-semibold">Aldrill AI 🚀 Assistant</h1>
          </div>
          <img src="/images/chatbot.png" alt="Toggle Sidebar" className="h-12 w-14 rounded-[5px]" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-36 space-y-4 bg-white">
          {justOpened && messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center text-center px-4">
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
            <>
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
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 sm:left-[260px] z-10 bg-white p-4 border-t flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex-1 flex items-center gap-2"
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
      </div>
    </div>
  );
};

export default Trending;
