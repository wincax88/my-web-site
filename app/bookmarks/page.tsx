'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkedPost {
  slug: string;
  title: string;
  addedAt: string;
}

export default function BookmarksPage() {
  const t = useTranslations('bookmarks');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem('bookmarked_posts');
      const data = stored ? JSON.parse(stored) : [];
      setBookmarks(data.sort((a: BookmarkedPost, b: BookmarkedPost) =>
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      ));
    } catch {
      setBookmarks([]);
    }
  };

  const removeBookmark = (slug: string) => {
    const updated = bookmarks.filter((b) => b.slug !== slug);
    localStorage.setItem('bookmarked_posts', JSON.stringify(updated));
    setBookmarks(updated);
  };

  const clearAll = () => {
    if (confirm(locale === 'zh' ? '确定要清空所有收藏吗？' : 'Are you sure you want to clear all bookmarks?')) {
      localStorage.removeItem('bookmarked_posts');
      setBookmarks([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Bookmark className="h-8 w-8 text-yellow-500" />
          {t('title')}
        </h1>
        {bookmarks.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            {tCommon('delete')} {tCommon('all')}
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-16 text-center">
          <Bookmark className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-700" />
          <p className="mb-4 text-lg text-gray-500 dark:text-gray-400">
            {t('noBookmarks')}
          </p>
          <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
            {t('noBookmarksDesc')}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            {t('browseArticles')}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {locale === 'zh' ? `共收藏 ${bookmarks.length} 篇文章` : `${bookmarks.length} bookmarked articles`}
          </p>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.slug}
              className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex-1">
                <Link
                  href={`/blog/${bookmark.slug}`}
                  className="text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                >
                  {bookmark.title}
                </Link>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {locale === 'zh' ? `收藏于 ${formatDate(bookmark.addedAt)}` : `Bookmarked on ${formatDate(bookmark.addedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/blog/${bookmark.slug}`}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  title={locale === 'zh' ? '阅读文章' : 'Read article'}
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => removeBookmark(bookmark.slug)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title={t('removeBookmark')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
