'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  const [error, setError] = useState<string | null>(null);
  const [lunr, setLunr] = useState<any>(null);
  const [lunrReady, setLunrReady] = useState(false);

  useEffect(() => {
    // 确保只在客户端加载
    if (typeof window === 'undefined') {
      return;
    }

    let indexLoaded = false;
    let lunrLoaded = false;

    const checkReady = () => {
      if (indexLoaded && lunrLoaded) {
        setLoading(false);
      }
    };

    // 动态加载 lunr
    const loadLunr = async () => {
      try {
        // 使用动态导入，确保在客户端环境中加载
        const lunrModule = await import('lunr');

        // lunr 2.x 使用 default 导出
        const lunrFn = lunrModule.default;

        if (typeof lunrFn === 'function') {
          setLunr(() => lunrFn); // 使用函数形式设置，确保是函数引用
          setLunrReady(true);
          lunrLoaded = true;
          checkReady();
        } else {
          console.error('lunr module structure:', lunrModule);
          throw new Error('lunr 不是一个函数');
        }
      } catch (err) {
        console.error('Failed to load lunr:', err);
        setError('搜索功能加载失败，请刷新页面重试');
        setLoading(false);
      }
    };

    loadLunr();

    // 加载搜索索引
    fetch('/api/search-index')
      .then((res) => {
        if (!res.ok) {
          throw new Error('搜索索引加载失败');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setIndex(data);
        } else {
          setIndex([]);
        }
        indexLoaded = true;
        checkReady();
      })
      .catch((err) => {
        console.error('Failed to load search index:', err);
        setError('搜索索引加载失败，请刷新页面重试');
        setLoading(false);
      });
  }, []);

  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const keywords = query
      .trim()
      .split(/\s+/)
      .filter((k) => k.length > 0)
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // 转义特殊字符

    if (keywords.length === 0) return text;

    const pattern = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      // 使用 pattern 的 lastIndex 重置，避免 test() 改变状态
      const testPattern = new RegExp(`(${keywords.join('|')})`, 'gi');
      if (testPattern.test(part)) {
        return (
          <mark
            key={index}
            className="rounded bg-yellow-200 px-1 dark:bg-yellow-900/50"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const searchResults = useMemo(() => {
    if (
      !query.trim() ||
      !lunr ||
      !lunrReady ||
      typeof lunr !== 'function' ||
      index.length === 0
    ) {
      return [];
    }

    try {
      // 构建 lunr 索引
      const idx = (lunr as any)(function (this: any) {
        this.ref('slug');
        this.field('title', { boost: 10 });
        this.field('description', { boost: 5 });
        this.field('content');
        this.field('tags', { boost: 3 });

        index.forEach((doc) => {
          this.add({
            slug: doc.slug,
            title: doc.title || '',
            description: doc.description || '',
            content: doc.content || '',
            tags: Array.isArray(doc.tags) ? doc.tags.join(' ') : '',
          });
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
        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
        .slice(0, 20); // 限制结果数量
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, [query, index, lunr, lunrReady]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">搜索</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">搜索</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
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
            className="block rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-800"
          >
            <h2 className="mb-2 text-xl font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400">
              {highlightText(result.title, query)}
            </h2>
            <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {highlightText(result.description, query)}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <time dateTime={result.date}>{formatDate(result.date)}</time>
              {result.tags && result.tags.length > 0 && (
                <div className="flex gap-2">
                  {result.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800"
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
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            没有找到相关文章，请尝试其他关键词
          </p>
        </div>
      )}

      {!query.trim() && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">输入关键词开始搜索</p>
        </div>
      )}
    </div>
  );
}
