'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { PostType } from '@/types/post';

interface SearchIndexItem {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lunr, setLunr] = useState<any>(null);

  useEffect(() => {
    // 动态加载 lunr
    import('lunr').then((lunrModule) => {
      setLunr(lunrModule);
    });

    // 加载搜索索引
    fetch('/api/search-index')
      .then((res) => res.json())
      .then((data) => {
        setIndex(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load search index:', err);
        setLoading(false);
      });
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim() || !lunr || index.length === 0) {
      return [];
    }

    try {
      // 构建 lunr 索引
      const idx = lunr(function (this: any) {
        this.ref('slug');
        this.field('title', { boost: 10 });
        this.field('description', { boost: 5 });
        this.field('content');
        this.field('tags', { boost: 3 });

        index.forEach((doc) => {
          this.add(doc);
        });
      });

      // 执行搜索
      const results = idx.search(query);
      
      // 获取匹配的文档
      return results
        .map((result: any) => {
          const doc = index.find((item) => item.slug === result.ref);
          return doc ? { ...doc, score: result.score } : null;
        })
        .filter((doc: any) => doc !== null)
        .slice(0, 20); // 限制结果数量
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [query, index, lunr]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">搜索</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {query.trim() && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          找到 {searchResults.length} 个结果
        </div>
      )}

      <div className="space-y-4">
        {searchResults.map((result: SearchIndexItem & { score?: number }) => (
          <Link
            key={result.slug}
            href={`/blog/${result.slug}`}
            className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {result.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {result.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <time dateTime={result.date}>{formatDate(result.date)}</time>
              {result.tags && result.tags.length > 0 && (
                <div className="flex gap-2">
                  {result.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {query.trim() && searchResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            没有找到相关文章，请尝试其他关键词
          </p>
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            输入关键词开始搜索
          </p>
        </div>
      )}
    </div>
  );
}

