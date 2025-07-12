'use client';

import {
  Plus, Search, BookImage, PlayCircle, LayoutGrid,
  Pencil, Trash2, LogOut, Menu, Rocket, X
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Chat {
  id: string;
  name: string;
  unread?: boolean;
}

interface SidebarProps {
  chats: {
    id: string;
    name: string;
    unread?: boolean;
  }[];
  userName: string; // ✅ Add this
  userImage: string; // ✅ And this
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, newName: string) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({
  chats, userName, userImage,
  onNewChat, onSelectChat, onRenameChat, onDeleteChat, onLogout
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const closeSidebar = () => setIsOpen(false);

  // Close sidebar on outside click (for small screens)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node)
      ) {
        closeSidebar();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Icon */}
      {/* Mobile Open Button - Left arrow */}
<button
  className="sm:hidden fixed top-19 left-0 z-50 bg-orange-500 w-10 text-white rounded-r-md px-2 py-2 shadow"
  onClick={() => setIsOpen(true)}
>
  <span className="text-lg font-bold">{'<'}</span>
</button>


      {/* Overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0 fixed sm:static top-0 left-0 z-50 w-[260px] h-screen bg-[color:var(--color-sidebar)] text-[color:var(--color-sidebar-foreground)] border-r border-[color:var(--color-sidebar-border)] transition-transform duration-300 ease-in-out`}
      >
        {/* Close Icon - Only on Mobile */}
        <div className="sm:hidden flex justify-end p-3">
          <X
            className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer"
            onClick={closeSidebar}
          />
        </div>

        {/* Top Section */}
        <div className="p-4 border-b border-[color:var(--color-sidebar-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold hidden sm:block">Coverso</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 py-2 space-y-2 border-b border-[color:var(--color-sidebar-border)]">
          <div className="flex flex-col gap-2 text-sm">
            <button className="flex items-center gap-2 hover:bg-[color:var(--color-sidebar-accent)] px-3 py-2 rounded transition">
              <BookImage className="w-4 h-4" /> Library
            </button>
            <button className="flex items-center gap-2 hover:bg-[color:var(--color-sidebar-accent)] px-3 py-2 rounded transition">
              <PlayCircle className="w-4 h-4" /> Sora
            </button>
            <button className="flex items-center gap-2 hover:bg-[color:var(--color-sidebar-accent)] px-3 py-2 rounded transition">
              <LayoutGrid className="w-4 h-4" /> GPTs
            </button>
          </div>
        </div>

        {/* Chats (You can add scrollable chat list here) */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* map over filteredChats if needed */}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto p-4 border-t border-[color:var(--color-sidebar-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={userImage}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm truncate max-w-[100px]">{userName}</span>
            </div>
            <LogOut
              className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer"
              onClick={onLogout}
            />
          </div>
          <button className="mt-3 w-full flex items-center gap-2 justify-center text-sm text-yellow-400 hover:text-yellow-500">
            <Rocket className="w-4 h-4" /> Upgrade Plan
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
