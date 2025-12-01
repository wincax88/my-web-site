'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { formatDate } from '@/lib/utils';
import { Send, Loader2, Shield } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // reCAPTCHA hook - may be undefined if not configured
  const { executeRecaptcha } = useGoogleReCaptcha();

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!author.trim() || !content.trim()) {
      setError('请填写作者和评论内容');
      return;
    }

    setSubmitting(true);

    try {
      // Get reCAPTCHA token if available
      let recaptchaToken: string | undefined;
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha('submit_comment');
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError);
          // Continue without token if reCAPTCHA fails
        }
      }

      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author, content, recaptchaToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || '评论已提交');
        setAuthor('');
        setContent('');
        // 刷新评论列表
        fetchComments();
      } else {
        setError(data.error || '提交失败，请稍后再试');
      }
    } catch (err) {
      setError('网络错误，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
        <h2 className="mb-6 text-2xl font-bold">评论</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 text-2xl font-bold">评论 ({comments.length})</h2>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="您的姓名"
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            disabled={submitting}
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下您的评论..."
            rows={4}
            maxLength={5000}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
            disabled={submitting}
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {content.length}/5000
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        {success && (
          <div className="text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                提交评论
              </>
            )}
          </button>
          {executeRecaptcha && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Shield className="h-3 w-3" />
              <span>reCAPTCHA 保护</span>
            </div>
          )}
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            暂无评论，成为第一个评论者吧！
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">{comment.author}</span>
                <time
                  dateTime={comment.createdAt}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
