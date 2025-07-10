'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Search } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
}

interface SidebarProps {
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, newName: string) => void;
  onDeleteChat: (id: string) => void;
}

const Sidebar = ({
  chats,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[280px] bg-[#f9f9f9] border-r h-screen p-4 flex flex-col">
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 text-sm bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
      >
        <Plus className="w-4 h-4" /> New Chat
      </button>

      <div className="relative mt-4">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search chats..."
          className="pl-10 pr-3 py-2 w-full rounded-md border text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 overflow-y-auto flex-1 space-y-2">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className="group flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm text-sm hover:bg-gray-100"
          >
            {editingId === chat.id ? (
              <input
                autoFocus
                className="text-sm flex-1 border px-2 py-1 rounded"
                defaultValue={chat.name}
                onBlur={(e) => {
                  onRenameChat(chat.id, e.target.value || 'Untitled Chat');
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRenameChat(chat.id, (e.target as HTMLInputElement).value || 'Untitled Chat');
                    setEditingId(null);
                  }
                }}
              />
            ) : (
              <div
                onClick={() => onSelectChat(chat.id)}
                className="flex-1 truncate cursor-pointer"
              >
                {chat.name}
              </div>
            )}

            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
              <Pencil
                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => setEditingId(chat.id)}
              />
              <Trash2
                className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => onDeleteChat(chat.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
