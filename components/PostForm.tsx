'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, Sparkles, Wand2, ChevronDown } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  published: boolean;
  tags: string[];
}

interface PostFormProps {
  post?: Post | null;
  onClose: () => void;
  onSave: () => void;
}

export function PostForm({ post, onClose, onSave }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showPolishMenu, setShowPolishMenu] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topic, setTopic] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content || '',
        tags: post.tags.join(', '),
        published: post.published,
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleGenerateAll = async () => {
    if (!topic.trim()) {
      setError('请输入文章主题');
      return;
    }

    setError('');
    setAiLoading('generate-all');
    setShowTopicInput(false);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'all',
          topic: topic.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'AI 生成失败');
        return;
      }

      // 填充所有字段
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        content: data.content || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        published: false,
      });

      setTopic('');
    } catch (err) {
      console.error('Error generating all fields:', err);
      setError('AI 生成失败，请稍后重试');
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerate = async (type: 'description' | 'outline' | 'full') => {
    setError('');
    setAiLoading(`generate-${type}`);
    setShowGenerateMenu(false);

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tags,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'AI 生成失败');
        return;
      }

      if (type === 'description') {
        setFormData((prev) => ({
          ...prev,
          description: data.content,
        }));
      } else if (type === 'outline' || type === 'full') {
        setFormData((prev) => ({
          ...prev,
          content: data.content,
        }));
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('AI 生成失败，请稍后重试');
    } finally {
      setAiLoading(null);
    }
  };

  const handlePolish = async (type: 'grammar' | 'style' | 'full') => {
    if (!formData.content || formData.content.trim().length === 0) {
      setError('请先输入内容再进行润色');
      return;
    }

    setError('');
    setAiLoading(`polish-${type}`);
    setShowPolishMenu(false);

    try {
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'AI 润色失败');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        content: data.content,
      }));
    } catch (err) {
      console.error('Error polishing content:', err);
      setError('AI 润色失败，请稍后重试');
    } finally {
      setAiLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        content: formData.content.trim() || null,
        tags,
        published: formData.published,
      };

      const url = post ? `/api/admin/posts/${post.id}` : '/api/admin/posts';
      const method = post ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '保存失败');
        return;
      }

      onSave();
    } catch (err) {
      console.error('Error saving post:', err);
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{post ? '编辑文章' : '新建文章'}</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!post && (
        <div className="mb-6">
          <div className="relative">
            {showTopicInput ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateAll();
                    } else if (e.key === 'Escape') {
                      setShowTopicInput(false);
                      setTopic('');
                    }
                  }}
                  placeholder="输入文章主题，例如：现代代码调试与性能优化"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleGenerateAll}
                  disabled={aiLoading === 'generate-all' || !topic.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aiLoading === 'generate-all' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>生成</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicInput(false);
                    setTopic('');
                  }}
                  className="rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTopicInput(true)}
                disabled={aiLoading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-6 py-4 text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/30"
              >
                {aiLoading === 'generate-all' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-medium">AI 正在生成全部字段...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">
                      AI 生成全部字段（标题+Slug+描述+内容+标签）
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            placeholder="输入文章标题"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            placeholder="文章URL标识符（如：my-first-post）"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            用于生成文章URL，只能包含字母、数字和连字符
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="description" className="block text-sm font-medium">
              描述 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowGenerateMenu(!showGenerateMenu);
                  setShowPolishMenu(false);
                }}
                disabled={aiLoading !== null}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                {aiLoading?.startsWith('generate') ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>AI 生成</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {showGenerateMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGenerateMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => handleGenerate('description')}
                      className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      生成描述
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('outline')}
                      className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      生成大纲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate('full')}
                      className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      生成完整文章
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            placeholder="文章简短描述"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="content" className="block text-sm font-medium">
              内容
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPolishMenu(!showPolishMenu);
                    setShowGenerateMenu(false);
                  }}
                  disabled={aiLoading !== null || !formData.content}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {aiLoading?.startsWith('polish') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span>AI 润色</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showPolishMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowPolishMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => handlePolish('grammar')}
                        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        语法润色
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePolish('style')}
                        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        风格优化
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePolish('full')}
                        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        全面润色
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateMenu(!showGenerateMenu);
                    setShowPolishMenu(false);
                  }}
                  disabled={aiLoading !== null}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {aiLoading?.startsWith('generate') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>AI 生成</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showGenerateMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowGenerateMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => handleGenerate('outline')}
                        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        生成大纲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerate('full')}
                        className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        生成完整文章
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={20}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            placeholder="输入文章内容（支持Markdown）"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            支持Markdown格式
          </p>
        </div>

        <div>
          <label htmlFor="tags" className="mb-2 block text-sm font-medium">
            标签
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tags: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            placeholder="用逗号分隔多个标签（如：JavaScript, React, Next.js）"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, published: e.target.checked }))
            }
            className="h-4 w-4"
          />
          <label htmlFor="published" className="text-sm font-medium">
            立即发布
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {post ? '更新' : '创建'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
