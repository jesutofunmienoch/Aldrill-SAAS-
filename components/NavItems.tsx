'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown, Menu } from "lucide-react";

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: '📖My Journey', href: '/my-journey' },
];

const aiItems = [
  { label: 'ChatGPT', href: '/ai/chatgpt' },
  { label: 'Grok AI', href: '/ai/grok' },
  { label: 'DeepSeek', href: '/ai/deepseek' },
  { label: 'Gemini', href: '/ai/gemini' },
];

const NavItems = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const aiDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(e.target as Node)) {
        setIsAIDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(false);
    setIsMenuOpen(false);
    setIsAIDropdownOpen(false);
  }, [pathname]);

  const handleLinkClick = (href: string) => {
    setLoading(true);
    router.push(href);
  };

  return (
    <>
      {/* DESKTOP / TABLET NAVBAR */}
      <nav className="hidden md:flex items-center gap-6 relative z-10">
        {navItems.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={() => handleLinkClick(href)}
            className={cn(
              'hover:text-primary transition-all',
              pathname === href && 'text-primary font-semibold'
            )}
          >
            {label}
          </Link>
        ))}

        {/* ASK AI DROPDOWN FOR DESKTOP ONLY */}
        <div ref={aiDropdownRef} className="relative">
          <button
            onClick={() => setIsAIDropdownOpen(prev => !prev)}
            className="flex items-center gap-1 text-black hover:text-primary transition-all"
          >
            Ask AI🧠 <ChevronDown className="w-5 h-5" />
          </button>

          {isAIDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white border rounded shadow-lg p-2 z-50 w-48">
              {aiItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => handleLinkClick(href)}
                  className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE MENU BUTTON */}
      <div className="md:hidden relative z-50">
        <button
          onClick={() => setIsMenuOpen(prev => !prev)}
          className="p-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-black" />
        </button>

        {/* MOBILE MENU CONTENT */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-md w-56 p-4 space-y-3 z-50"
          >
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => handleLinkClick(href)}
                className={cn(
                  "block text-base hover:text-blue-600",
                  pathname === href && "text-blue-600 font-bold"
                )}
              >
                {label}
              </Link>
            ))}

            {/* AI ITEMS DIRECTLY IN MOBILE NAVBAR (NO DROPDOWN) */}
            <div className="border-t pt-3">
              <span className="text-xs text-gray-500 font-semibold mb-1 block">ALL IN ONE AI TOOLS</span>
              {aiItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => handleLinkClick(href)}
                  className={cn(
                    "block text-sm hover:text-black",
                    pathname === href && "text-primary font-semibold"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LOADING SCREEN */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-primary">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default NavItems;
