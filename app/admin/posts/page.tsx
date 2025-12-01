'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { formatDate } from '@/lib/utils';
import { PostForm } from '@/components/PostForm';
import { LoginModal } from '@/components/LoginModal';
import { Loader2, Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';

interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  tags: string[];
  commentsCount: number;
  coverImage: string | null;
}

export default function AdminPostsPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowLoginModal(true);
    } else if (status === 'authenticated') {
      setShowLoginModal(false);
    }
  }, [status]);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // 刷新页面以更新 session
    router.refresh();
  };

  const handleLoginClose = () => {
    // 如果关闭登录窗口且未登录，返回首页
    if (status !== 'authenticated') {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const fetchPosts = useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/posts?page=${page}&includeDrafts=${includeDrafts}`
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        console.error('获取文章列表失败');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, includeDrafts, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [fetchPosts, status]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPosts();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (post: Post) => {
    try {
      // 获取完整的文章数据（包括 content）
      const response = await fetch(`/api/admin/posts/${post.id}`);
      if (response.ok) {
        const fullPost = await response.json();
        setEditingPost(fullPost);
        setShowForm(true);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '获取文章详情失败');
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      alert('获取文章详情失败');
    }
  };

  const handleNew = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPost(null);
    fetchPosts();
  };

  // 加载中状态
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 如果未登录，显示登录窗口
  if (status !== 'authenticated') {
    return (
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  if (showForm) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <PostForm
          post={editingPost}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">文章管理</h1>
        <div className="flex items-center gap-4">
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
            onClick={handleNew}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            新建文章
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={includeDrafts}
            onChange={(e) => {
              setIncludeDrafts(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4"
          />
          <span>包含草稿</span>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="w-[10%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    封面
                  </th>
                  <th className="w-[20%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    标题
                  </th>
                  <th className="w-[12%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    Slug
                  </th>
                  <th className="w-[7%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    状态
                  </th>
                  <th className="w-[12%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    标签
                  </th>
                  <th className="w-[7%] border border-gray-300 bg-blue-100 px-4 py-2 text-left dark:border-gray-700 dark:bg-blue-900/30">
                    浏览量
                  </th>
                  <th className="w-[7%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    评论数
                  </th>
                  <th className="w-[10%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    创建时间
                  </th>
                  <th className="w-[11%] border border-gray-300 px-4 py-2 text-left dark:border-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
                      {post.coverImage ? (
                        <div className="relative aspect-video overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100px, 120px"
                            unoptimized={post.coverImage.startsWith('http')}
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-video overflow-hidden rounded bg-gradient-to-br from-blue-400 to-purple-500" />
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
                      <div className="font-medium">{post.title}</div>
                      <div className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {post.description}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                      <div className="truncate">{post.slug}</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          post.published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {post.published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 bg-blue-50 px-4 py-2 text-sm dark:border-gray-700 dark:bg-blue-900/20">
                      {post.views}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">
                      {post.commentsCount}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="查看"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleEdit(post)}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="删除"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
