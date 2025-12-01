'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoginModal } from '@/components/LoginModal';
import { formatDate } from '@/lib/utils';
import {
  Loader2,
  LogOut,
  FileText,
  BookOpen,
  MessageSquare,
  Tag,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Analytics {
  overview: {
    posts: { total: number; published: number; draft: number };
    courses: { total: number; published: number; lessons: number };
    comments: { total: number; pending: number; approved: number };
    tags: number;
    totalViews: number;
  };
  topPosts: Array<{
    id: string;
    slug: string;
    title: string;
    views: number;
    commentsCount: number;
    publishedAt?: string;
  }>;
  recentComments: Array<{
    id: string;
    author: string;
    content: string;
    approved: boolean;
    createdAt: string;
    post: { slug: string; title: string };
  }>;
  tagStats: Array<{
    name: string;
    postsCount: number;
    coursesCount: number;
  }>;
  postsByDay: Array<{ date: string; count: number }>;
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  subValue?: string;
  icon: typeof FileText;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {subValue && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subValue}</p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/analytics')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setAnalytics(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status]);

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
        <h1 className="text-4xl font-bold">数据统计</h1>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* 概览卡片 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="文章总数"
              value={analytics.overview.posts.total}
              subValue={`${analytics.overview.posts.published} 已发布 / ${analytics.overview.posts.draft} 草稿`}
              icon={FileText}
              color="bg-blue-500"
            />
            <StatCard
              title="课程总数"
              value={analytics.overview.courses.total}
              subValue={`${analytics.overview.courses.lessons} 个课时`}
              icon={BookOpen}
              color="bg-purple-500"
            />
            <StatCard
              title="评论总数"
              value={analytics.overview.comments.total}
              subValue={`${analytics.overview.comments.pending} 待审核`}
              icon={MessageSquare}
              color="bg-green-500"
            />
            <StatCard
              title="总浏览量"
              value={analytics.overview.totalViews.toLocaleString()}
              subValue={`${analytics.overview.tags} 个标签`}
              icon={Eye}
              color="bg-orange-500"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* 热门文章 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">热门文章 Top 10</h2>
              </div>
              <div className="space-y-3">
                {analytics.topPosts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">暂无数据</p>
                ) : (
                  analytics.topPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            index < 3
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="font-medium hover:text-blue-600"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 最近评论 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-semibold">最近评论</h2>
                </div>
                <Link
                  href="/admin/comments"
                  className="text-sm text-blue-600 hover:underline"
                >
                  查看全部
                </Link>
              </div>
              <div className="space-y-3">
                {analytics.recentComments.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">暂无评论</p>
                ) : (
                  analytics.recentComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author}</span>
                          {comment.approved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                        {comment.content}
                      </p>
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {comment.post.title}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 标签统计 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold">热门标签</h2>
              </div>
              <Link
                href="/admin/tags"
                className="text-sm text-blue-600 hover:underline"
              >
                管理标签
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {analytics.tagStats.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">暂无标签</p>
              ) : (
                analytics.tagStats.map((tag) => (
                  <div
                    key={tag.name}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-800"
                  >
                    <span className="font-medium">{tag.name}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {tag.postsCount + tag.coursesCount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Link
              href="/admin/posts"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">文章管理</p>
                <p className="text-sm text-gray-500">管理博客文章</p>
              </div>
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <BookOpen className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">课程管理</p>
                <p className="text-sm text-gray-500">管理教程课程</p>
              </div>
            </Link>
            <Link
              href="/admin/comments"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">评论管理</p>
                <p className="text-sm text-gray-500">
                  {analytics.overview.comments.pending > 0
                    ? `${analytics.overview.comments.pending} 条待审核`
                    : '审核评论'}
                </p>
              </div>
            </Link>
            <Link
              href="/admin/tags"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <Tag className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium">标签管理</p>
                <p className="text-sm text-gray-500">管理文章标签</p>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">加载统计数据失败</p>
        </div>
      )}
    </div>
  );
}
