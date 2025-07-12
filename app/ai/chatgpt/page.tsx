'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Send, Loader2, Square, Copy, Check, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/ComponentSidebar'; 
import { ArrowUp } from "lucide-react";

interface Message {
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const ChatGPT = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<{ id: string; name: string; messages: Message[] }[]>([]);
  const [currentChatId, setCurrentChatId] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedIndex, setLikedIndex] = useState<number | null>(null);
  const [justOpened, setJustOpened] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistories');
    const storedId = localStorage.getItem('currentChatId');
    if (storedChats) setChatHistories(JSON.parse(storedChats));
    if (storedId) setCurrentChatId(storedId);
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
    let newMessages = [...messages, userMessage];
    let chatId = currentChatId;

    if (!chatId) {
      chatId = String(Date.now());
      const title = userMessage.content.split(' ').slice(0, 5).join(' ') + '...';
      const newChat = { id: chatId, name: title, messages: [userMessage] };
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
        content: '⚠️ Oops! Something went wrong.',
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

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId('');
    setJustOpened(true);
  };

  const handleSelectChat = (id: string) => {
    const chat = chatHistories.find((chat) => chat.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      setJustOpened(false);
    }
  };

  const handleRenameChat = (id: string, newName: string) => {
    setChatHistories((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
    );
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistories.filter((chat) => chat.id !== id);
    setChatHistories(updated);
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleLogout = () => {
    document.getElementById("clerk-sign-out-button")?.click();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-black">
      <Sidebar
        chats={chatHistories}
        userName={user?.fullName || "Anonymous"}
        userImage={user?.imageUrl || "/images/default-avatar.png"}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1">
        

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 md:px-10 py-12 pb-36 space-y-6 bg-white">

          {justOpened && messages.length === 0 && !loading ? (
            <div className="text-center mt-10 md:pt-50">

  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-md">
    🚀 CHAT WITH AI
  </h2>
  <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
    YOUR INTELLIGENT COMPANION FOR <span className="font-semibold text-primary">QUESTIONS</span>,
    <span className="font-semibold text-purple-600"> RESEARCH</span>, AND
    <span className="font-semibold text-rose-500"> DAILY PRODUCTIVITY</span>. 
  </p>
</div>

          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={cn('flex flex-col gap-1', msg.sender === 'user' ? 'items-end' : 'items-start')}>
                  <span className="text-xs text-gray-500">{msg.sender === 'user' ? 'You' : 'ChatGPT'} • {msg.timestamp}</span>
                  <div className={cn('p-3 max-w-xl rounded-xl text-sm whitespace-pre-wrap', msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-black shadow')}>
                    {msg.content}
                  </div>
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                      {copiedIndex === idx ? (
                        <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                      ) : (
                        <Copy className="w-4 h-4 cursor-pointer hover:text-black" onClick={() => handleCopy(msg.content, idx)} />
                      )}
                      <ThumbsUp className="w-4 h-4 cursor-pointer hover:text-black" />
                      <ThumbsDown className="w-4 h-4 cursor-pointer hover:text-red-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
  <div className="flex items-start gap-2 text-sm text-gray-500">
    <Loader2 className="w-4 h-4 animate-spin" />
    Typing...
  </div>
)}
<div ref={bottomRef} className="h-13" />

            </>
          )}
        </div>

        <form
  onSubmit={(e) => {
    e.preventDefault();
    handleSend();
  }}
  className="fixed left-0 md:left-[260px] right-0 bottom-6 flex justify-center px-4 md:px-6"

>
<div className="relative w-full max-w-3xl bg-gray-100 border border-gray-300 rounded-3xl shadow-md px-4 pt-2 pb-3 flex flex-col gap-2 min-h-[100px]">

    {/* Quick Insert Buttons */}
    <div className="overflow-x-auto scrollbar-hide px-4">
  <div className="flex gap-2 flex-nowrap pr-4">
    {[ 
      { label: "Birthday", icon: "🎂" },
      { label: "Trending", icon: "📈" },
      { label: "Edit Image", icon: "🖼️" },
      { label: "Research", icon: "🔍" },
    ].map(({ label, icon }) => (
      <button
        key={label}
        type="button"
        className="flex-shrink-0 flex items-center gap-1 border border-gray-400 rounded-full px-5 py-2 cursor-pointer text-sm text-gray-700 hover:bg-white transition"
        onClick={() => setInput((prev) => `${prev} ${icon} ${label}`.trim())}
      >
        <span>{icon}</span> {label}
      </button>
    ))}
  </div>
</div>



    {/* Textarea */}
    <textarea
      ref={textareaRef}
      rows={3}
      placeholder="What do you want to know?...."
      className="flex-1 resize-none bg-transparent outline-none text-sm max-h-[140px] min-h-[80px]"
      value={input}
      onChange={handleInputChange}
      onKeyDown={handleKeyPress}
    />

    {/* Send Button (Arrow Up floating middle right) */}
    {loading ? (
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-500 rounded-full text-white"
        onClick={() => {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          setLoading(false);
        }}
      >
        <Square className="w-5 h-5" />
      </button>
    ) : (
      <button
        type="submit"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-white"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    )}
  </div>
</form>

      </div>
    </div>
  );
};

export default ChatGPT;
