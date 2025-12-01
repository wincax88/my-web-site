'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  slug: string;
  title: string;
}

export function BookmarkButton({ slug, title }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.some((b) => b.slug === slug));
  }, [slug]);

  const getBookmarks = (): Array<{
    slug: string;
    title: string;
    addedAt: string;
  }> => {
    try {
      const stored = localStorage.getItem('bookmarked_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveBookmarks = (
    bookmarks: Array<{ slug: string; title: string; addedAt: string }>
  ) => {
    localStorage.setItem('bookmarked_posts', JSON.stringify(bookmarks));
  };

  const handleToggle = () => {
    const bookmarks = getBookmarks();

    if (isBookmarked) {
      const updated = bookmarks.filter((b) => b.slug !== slug);
      saveBookmarks(updated);
      setIsBookmarked(false);
    } else {
      bookmarks.push({
        slug,
        title,
        addedAt: new Date().toISOString(),
      });
      saveBookmarks(bookmarks);
      setIsBookmarked(true);
    }
  };

  if (!hasMounted) {
    return (
      <button
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
        disabled
      >
        <Bookmark className="h-4 w-4" />
        <span>收藏</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
        isBookmarked
          ? 'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
          : 'border-gray-200 text-gray-600 hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-yellow-800 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400'
      }`}
      title={isBookmarked ? '取消收藏' : '收藏文章'}
    >
      <Bookmark
        className={`h-4 w-4 transition-transform ${isBookmarked ? 'scale-110 fill-current' : ''}`}
      />
      <span>{isBookmarked ? '已收藏' : '收藏'}</span>
    </button>
  );
}
