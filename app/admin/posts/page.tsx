'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { PostForm } from '@/components/PostForm';
import { Loader2, Plus, Edit, Trash2, Eye } from 'lucide-react';

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
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [includeDrafts, setIncludeDrafts] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/posts?page=${page}&includeDrafts=${includeDrafts}`
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } else {
        console.error('获取文章列表失败');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, includeDrafts]);

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

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowForm(true);
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

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">文章管理</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建文章
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeDrafts}
            onChange={(e) => {
              setIncludeDrafts(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4"
          />
          <span>包含草稿</span>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    标题
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    Slug
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    状态
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    标签
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    浏览量
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    评论数
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                    创建时间
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
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
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {post.description}
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {post.slug}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          post.published
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {post.published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
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
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm">
                      {post.views}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm">
                      {post.commentsCount}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                      <div className="flex items-center gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="查看"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                          title="删除"
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
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
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 border rounded ${
                      p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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

