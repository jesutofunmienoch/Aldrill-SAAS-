'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Companions', href: '/companions' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'My Journey', href: '/my-journey' },
  { label: 'Trending-Alerts', href: '/trending' },
];

const NavItems = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (targetHref && pathname === targetHref) {
      setLoading(false);
      setTargetHref(null);
      setIsMenuOpen(false); // close mobile menu on route change
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
            className={cn(
              pathname === href && 'text-primary font-semibold'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden relative z-50">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-2"
          aria-label="Toggle menu"
        >
          <Image
            src="/icon/maths.svg" // ✅ Your custom icon
            alt="Menu"
            width={30}
            height={30}
          />
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-md shadow-md w-48 p-4 space-y-3 z-50">
            {navItems.map(({ label, href }) => (
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
