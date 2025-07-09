"use client";

import { removeBookmark, addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmark = async () => {
    try {
      setBookmarkLoading(true);
      if (bookmarked) {
        await removeBookmark(id, pathname);
      } else {
        await addBookmark(id, pathname);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    router.push(`/companions/${id}`);
  };

  return (
    <article className="companion-card relative" style={{ backgroundColor: color }}>
      {/* Fullscreen loader on lesson launch */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-black/80 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {/* Bookmark loader overlay */}
      {bookmarkLoading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button className="companion-bookmark" onClick={handleBookmark} disabled={bookmarkLoading}>
          <Image
            src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
            alt="bookmark"
            width={12.5}
            height={15}
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>

      <div className="flex items-center gap-2">
        <Image src="/icons/clock.svg" alt="duration" width={13.5} height={13.5} />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <button
        onClick={handleLaunch}
        className="btn-primary w-full justify-center mt-4"
        disabled={loading}
      >
        Launch Lesson
      </button>
    </article>
  );
};

export default CompanionCard;
