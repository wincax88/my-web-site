'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoginModal } from '@/components/LoginModal';
import { formatDate } from '@/lib/utils';
import {
  Loader2,
  Check,
  X,
  Trash2,
  Edit,
  LogOut,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Reply {
  id: string;
  author: string;
  content: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    slug: string;
    title: string;
  };
  replies: Reply[];
}

export default function AdminCommentsPage() {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved'
  >('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
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

  const fetchComments = useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/comments?page=${page}&status=${statusFilter}`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setTotalPages(data.totalPages);
        setPendingCount(data.pendingCount);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        console.error('获取评论列表失败');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchComments();
    }
  }, [fetchComments, status]);

  const handleApprove = async (id: string, approve: boolean) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: approve }),
      });

      if (response.ok) {
        await fetchComments();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('操作失败');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm('确定要删除这条评论吗？此操作将同时删除所有回复，且不可撤销。')
    ) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchComments();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('删除失败');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.size === 0) {
      alert('请先选择评论');
      return;
    }

    const actionLabel =
      action === 'approve' ? '批准' : action === 'reject' ? '拒绝' : '删除';
    if (!confirm(`确定要${actionLabel}选中的 ${selectedIds.size} 条评论吗？`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/comments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
        }),
      });

      if (response.ok) {
        setSelectedIds(new Set());
        await fetchComments();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Error batch operation:', error);
      alert('操作失败');
    }
  };

  const handleEditSave = async () => {
    if (!editingComment) return;

    setProcessingIds((prev) => new Set(prev).add(editingComment.id));
    try {
      const response = await fetch(`/api/admin/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingComment.content }),
      });

      if (response.ok) {
        setEditingComment(null);
        await fetchComments();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('保存失败');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(editingComment.id);
        return next;
      });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)));
    }
  };

  const renderComment = (
    comment: Comment | Reply,
    isReply = false,
    depth = 0
  ) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies =
      'replies' in comment && comment.replies && comment.replies.length > 0;
    const isProcessing = processingIds.has(comment.id);
    const isEditing = editingComment?.id === comment.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4 dark:border-gray-700' : ''}`}
      >
        <div
          className={`rounded-lg border p-4 ${
            comment.approved
              ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {!isReply && (
              <input
                type="checkbox"
                checked={selectedIds.has(comment.id)}
                onChange={() => toggleSelect(comment.id)}
                className="mt-1 h-4 w-4"
              />
            )}

            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.author}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      comment.approved
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {comment.approved ? '已审核' : '待审核'}
                  </span>
                  {hasReplies && (
                    <button
                      onClick={() => toggleExpanded(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {(comment as Comment).replies?.length} 条回复
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {!isReply && 'post' in comment && (
                <div className="mb-2 text-xs text-gray-500">
                  文章：
                  <Link
                    href={`/blog/${comment.post.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {comment.post.title}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </Link>
                </div>
              )}

              {isEditing ? (
                <div className="mb-3">
                  <textarea
                    value={editingComment.content}
                    onChange={(e) =>
                      setEditingComment({
                        ...editingComment,
                        content: e.target.value,
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleEditSave}
                      disabled={isProcessing}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isProcessing ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => setEditingComment(null)}
                      className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              )}

              <div className="flex items-center gap-2">
                {!comment.approved && (
                  <button
                    onClick={() => handleApprove(comment.id, true)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                    title="批准"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    批准
                  </button>
                )}
                {comment.approved && (
                  <button
                    onClick={() => handleApprove(comment.id, false)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700 disabled:opacity-50"
                    title="取消批准"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    取消批准
                  </button>
                )}
                <button
                  onClick={() =>
                    setEditingComment({
                      id: comment.id,
                      content: comment.content,
                    })
                  }
                  disabled={isProcessing}
                  className="flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  title="编辑"
                >
                  <Edit className="h-3 w-3" />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  title="删除"
                >
                  {isProcessing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 显示回复 */}
        {hasReplies && isExpanded && (
          <div className="mt-2 space-y-2">
            {(comment as Comment).replies.map((reply) =>
              renderComment(reply, true, depth + 1)
            )}
          </div>
        )}
      </div>
    );
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
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">评论管理</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-sm text-white">
              {pendingCount} 待审核
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            数据统计
          </Link>
          <Link
            href="/admin/posts"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            文章管理
          </Link>
          <Link
            href="/admin/courses"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            课程管理
          </Link>
          <Link
            href="/admin/tags"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            标签管理
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
        </div>
      </div>

      {/* 筛选和批量操作 */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            筛选：
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'pending' | 'approved');
              setPage(1);
            }}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="all">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已审核</option>
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已选中 {selectedIds.size} 条
            </span>
            <button
              onClick={() => handleBatchAction('approve')}
              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              批量批准
            </button>
            <button
              onClick={() => handleBatchAction('reject')}
              className="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
            >
              批量拒绝
            </button>
            <button
              onClick={() => handleBatchAction('delete')}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500 dark:text-gray-400">暂无评论</p>
        </div>
      ) : (
        <>
          {/* 全选 */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selectedIds.size === comments.length && comments.length > 0
              }
              onChange={selectAll}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              全选
            </span>
          </div>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
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
