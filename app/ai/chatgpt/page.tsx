'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Plus,
  Trash,
  Pencil,
  Search,
  Menu,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  LogOut,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, SignOutButton } from '@clerk/nextjs';

interface Message {
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}



const Trending = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<{ id: string; title: string; messages: Message[] }[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedIndex, setLikedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [justOpened, setJustOpened] = useState(true);
   const textareaRef = useRef<HTMLTextAreaElement>(null); 
   const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);


   // ✅ move this function INSIDE the component so it has access to `setInput` and `textareaRef`
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // reset
      textarea.style.height = `${textarea.scrollHeight}px`; // auto-expand
    }
  };


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



const handleSend = async () => {
  if (!input.trim()) return;
  setJustOpened(false);

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const userMessage: Message = { sender: 'user', content: input, timestamp: now };

  // Create new chat ID + title if starting a new chat
  let newMessages = [...messages, userMessage];
  let chatId = currentChatId;

  if (!chatId) {
    chatId = String(Date.now());
    const title = userMessage.content.split(' ').slice(0, 5).join(' ') + '...';
    const newChat = { id: chatId, title, messages: [userMessage] };
    setChatHistories((prev) => [...prev, newChat]);
    setCurrentChatId(chatId);
  } else {
    setChatHistories((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat))
    );
  }

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
    const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'bot', content: '', timestamp: botTime }]);

    typingIntervalRef.current = setInterval(() => {
      index++;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: 'bot',
          content: reply.slice(0, index),
          timestamp: botTime,
        };

        // update the corresponding chat history with bot message
        setChatHistories((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...updated] } : chat
          )
        );

        return updated;
      });

      if (index >= reply.length) {
        clearInterval(typingIntervalRef.current!);
        typingIntervalRef.current = null;
        setLoading(false);
      }
    }, 20);
  } catch (err) {
    console.error(err);
    const errorMessage: Message = {
      sender: 'bot',
      content: '⚠️ Oops! Something went wrong. Please try again.',
      timestamp: now,
    };
    const failedMessages = [...newMessages, errorMessage];
    setMessages(failedMessages);

    setChatHistories((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, messages: failedMessages } : chat))
    );
    setLoading(false);
  }
};



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
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
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 sm:hidden cursor-pointer" />
      )}

      <div
        className={cn(
          'fixed sm:static top-0 left-0 z-50 sm:z-0 h-full w-[260px] border-r bg-white px-4 pt-4 pb-3 flex flex-col transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        )}
      >
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
            <div
              key={chat.id}
              className="flex items-center justify-between p-2 bg-muted hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => handleSelectChat(chat.id)}
            >
              <span className="text-sm truncate w-40" title={chat.title}>{chat.title}</span>
              <div className="flex items-center gap-1">
                <Pencil size={14} className="text-gray-500 hover:text-black" onClick={() => handleRenameChat(chat.id)} />
                <Trash size={14} className="text-gray-500 hover:text-red-600" onClick={() => handleDeleteChat(chat.id)} />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 mt-3 text-xs text-gray-700">
          {user && (
            <div className="flex flex-col gap-1 mb-2">
              <span className="font-medium text-sm">{user.fullName}</span>
              <span className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</span>
            </div>
          )}
          <SignOutButton>
            <button className="flex items-center gap-2 text-red-500 hover:text-red-700">
              <LogOut size={16} /> Logout
            </button>
          </SignOutButton>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="sm:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu />
            </button>
            <h1 className="text-lg font-semibold">ChatGPT</h1>
          </div>
          <img src="/images/chatbot.png" alt="Toggle Sidebar" className="h-10 w-11 rounded-[5px]" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-32 py-12 pb-36 space-y-6 bg-white">
          {justOpened && messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center text-center px-12">
              <img src="/images/chatbot.png" alt="Chat AI" className="w-28 h-28 mb-4 object-contain rounded-[12px]" />
              <h2 className="text-xl font-semibold">💬 Powered by Aldrill.</h2>
              <p className="text-muted-foreground mb-6">🚀 An AI Created By ENOCH powerful language model</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-xl w-full">
                {['🧠 Explain quantum computing', '📖 Write a creative story', '💻 Help me code a function'].map((example, i) => (
                  <div key={i} className="bg-white text-black p-4 rounded-xl shadow-sm text-sm cursor-pointer hover:bg-gray-100" onClick={() => setInput(example)}>
                    {example}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={cn('flex flex-col gap-1', msg.sender === 'user' ? 'items-end' : 'items-start')}>
                  <span className="text-xs text-gray-500">{msg.sender === 'user' ? 'You' : 'ChatGPT'} • {msg.timestamp}</span>
                  <div className={cn('p-3 max-w-xs md:max-w-md lg:max-w-2xl rounded-xl text-sm whitespace-pre-wrap', msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-black rounded-bl-none shadow-sm')}>
                    {msg.content}
                  </div>
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-3 mt-2 text-gray-500">
                      {copiedIndex === idx ? (
                        <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                      ) : (
                        <Copy className="w-4 h-4 cursor-pointer hover:text-black" onClick={() => handleCopy(msg.content, idx)} />
                      )}
                      <ThumbsUp
                        className={cn('w-4 h-4 cursor-pointer hover:text-black', likedIndex === idx ? 'text-orange-500' : '')}
                        onClick={() => setLikedIndex((prev) => (prev === idx ? null : idx))}
                      />
                      <ThumbsDown className="w-4 h-4 cursor-pointer hover:text-red-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs text-gray-500">ChatGPT • Typing...</span>
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

        <div className="fixed bottom-0 left-0 right-0 sm:left-[260px] z-10 bg-white p-4 border-t flex justify-center">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="w-full max-w-2xl flex items-center gap-2">
  <textarea
  ref={textareaRef}
  rows={1}
  className="flex-1 resize-none border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm max-h-48 overflow-y-auto"
  placeholder="💬 Ask me anything..."
  value={input}
  onChange={handleInputChange}
  onKeyDown={handleKeyPress}
/>

{loading ? (
  <button
    type="button"
    className="p-2 bg-red-500 rounded-md text-white hover:bg-red-600"
    onClick={() => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setLoading(false);
    }}
  >
    <Square className="w-4 h-4" />
  </button>
) : (
  <button
    type="submit"
    disabled={loading}
    className="p-2 bg-primary rounded-md text-white hover:bg-primary/90"
  >
    <Send className="w-4 h-4" />
  </button>
)}

          </form>
        </div>
      </div>
    </div>
  );
};

export default Trending;
