'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoginModal } from '@/components/LoginModal';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Tag as TagIcon,
  Search,
  X,
  FileText,
  BookOpen,
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  postsCount: number;
  coursesCount: number;
}

export default function AdminTagsPage() {
  const { data: session, status } = useSession();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowLoginModal(true);
    } else if (status === 'authenticated') {
      setShowLoginModal(false);
    }
  }, [status]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    router.refresh();
  };

  const handleLoginClose = () => {
    if (status !== 'authenticated') {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const fetchTags = useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
      });
      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/tags?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        console.error('获取标签列表失败');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTags();
    }
  }, [fetchTags, status]);

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      setError('请输入标签名称');
      return;
    }

    setError('');
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (response.ok) {
        setNewTagName('');
        setShowNewForm(false);
        await fetchTags();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        setError(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setError('创建失败');
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !editingTag.name.trim()) {
      setError('请输入标签名称');
      return;
    }

    setError('');
    setProcessingId(editingTag.id);
    try {
      const response = await fetch(`/api/admin/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingTag.name.trim() }),
      });

      if (response.ok) {
        setEditingTag(null);
        await fetchTags();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        setError(data.error || '更新失败');
      }
    } catch (error) {
      console.error('Error updating tag:', error);
      setError('更新失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (tag: Tag) => {
    const message =
      tag.postsCount > 0 || tag.coursesCount > 0
        ? `该标签关联了 ${tag.postsCount} 篇文章和 ${tag.coursesCount} 个课程，删除后将取消关联。确定删除吗？`
        : '确定要删除这个标签吗？';

    if (!confirm(message)) {
      return;
    }

    setProcessingId(tag.id);
    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTags();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('删除失败');
    } finally {
      setProcessingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">标签管理</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            文章管理
          </Link>
          <Link
            href="/admin/comments"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            评论管理
          </Link>
          <Link
            href="/admin/courses"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            课程管理
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {session?.user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            新建标签
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="搜索标签..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <span className="text-sm text-gray-500">共 {tags.length} 个标签</span>
      </div>

      {/* 新建标签表单 */}
      {showNewForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="输入新标签名称"
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setShowNewForm(false);
              }}
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              创建
            </button>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewTagName('');
                setError('');
              }}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              取消
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : tags.length === 0 ? (
        <div className="py-12 text-center">
          <TagIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">
            {search ? '没有找到匹配的标签' : '暂无标签'}
          </p>
        </div>
      ) : (
        <>
          {/* 标签列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                {editingTag?.id === tag.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={(e) =>
                        setEditingTag({ ...editingTag, name: e.target.value })
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setEditingTag(null);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        disabled={processingId === tag.id}
                        className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processingId === tag.id ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingTag(null);
                          setError('');
                        }}
                        className="flex-1 rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium">
                        <TagIcon className="h-4 w-4 text-blue-500" />
                        {tag.name}
                      </span>
                    </div>
                    <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {tag.postsCount} 篇文章
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {tag.coursesCount} 个课程
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                        className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-3 w-3" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        disabled={processingId === tag.id}
                        className="flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {processingId === tag.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        删除
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded border px-4 py-2 ${
                    p === page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
