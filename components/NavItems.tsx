'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ChevronDown, Menu } from "lucide-react";

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: '📖My Journey', href: '/my-journey' },
];

const aiDropdownItems = [
  { label: 'ChatGPT', href: '/ai/chatgpt' },
  { label: 'Grok AI', href: '/ai/grok' },
  { label: 'DeepSeek', href: '/ai/deepseek' },
  { label: 'Gemini', href: '/ai/gemini' },
];

const NavItems = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);

  useEffect(() => {
    if (targetHref && pathname === targetHref) {
      setLoading(false);
      setTargetHref(null);
      setIsMenuOpen(false);
      setIsAIDropdownOpen(false);
    }
  }, [pathname, targetHref]);

  const handleClick = async (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname !== href) {
      setLoading(true);
      setTargetHref(href);
      router.push(href);
    } else {
      setIsMenuOpen(false);
      setIsAIDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 relative z-10">
        {navItems.map(({ label, href }) => (
          <Link
            href={href}
            key={label}
            onClick={(e) => handleClick(e, href)}
            className={cn(pathname === href && 'text-primary font-semibold')}
          >
            {label}
          </Link>
        ))}

        {/* Ask AI Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAIDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 text-black hover:text-primary transition-all"
          >
            Ask AI🧠 <ChevronDown className="w-6 h-4" />
          </button>

          {isAIDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white border rounded shadow-lg p-2 z-20">
              {aiDropdownItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden relative z-50">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-black" />
        </button>

        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-md w-56 p-4 space-y-3 z-50">
            {[...navItems, { label: 'Ask AI🧠', href: '/trending' }].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={(e) => handleClick(e, href)}
                className={cn(
                  "block text-base hover:text-blue-600",
                  pathname === href && "text-blue-600 font-bold"
                )}
              >
                {label}
              </Link>
            ))}

            <div className="border-t pt-2">
              <p className="font-medium text-sm text-gray-700 mb-1">🔍 AI Models</p>
              {aiDropdownItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={(e) => handleClick(e, href)}
                  className="block pl-2 text-sm text-gray-600 hover:text-black"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global loading overlay */}
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
