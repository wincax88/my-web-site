'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoginModal } from '@/components/LoginModal';
import { CourseForm } from '@/components/CourseForm';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  BookOpen,
  Clock,
} from 'lucide-react';
import { LEVEL_LABELS, CourseLevel } from '@/types/course';

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  duration?: number | null;
  published: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  level: CourseLevel;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  lessonsCount: number;
  totalDuration: number;
  lessons?: Lesson[];
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [includeDrafts, setIncludeDrafts] = useState(true);
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

  const fetchCourses = useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/courses?page=${page}&includeDrafts=${includeDrafts}`
      );
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        console.error('获取课程列表失败');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, includeDrafts, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCourses();
    }
  }, [fetchCourses, status]);

  const handleDelete = async (id: string) => {
    if (
      !confirm('确定要删除这个课程吗？此操作将同时删除所有课时，且不可撤销。')
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCourses();
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (course: Course) => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`);
      if (response.ok) {
        const fullCourse = await response.json();
        setEditingCourse(fullCourse);
        setShowForm(true);
      } else if (response.status === 401) {
        setShowLoginModal(true);
      } else {
        const data = await response.json();
        alert(data.error || '获取课程详情失败');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('获取课程详情失败');
    }
  };

  const handleNew = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
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

  if (showForm) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <CourseForm
          course={editingCourse}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">课程管理</h1>
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
            href="/admin/comments"
            className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400"
          >
            评论管理
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
          <button
            onClick={handleNew}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            新建课程
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
      ) : courses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无课程</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              >
                {/* 封面 */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-purple-500">
                  {course.coverImage && (
                    <Image
                      src={course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={course.coverImage.startsWith('http')}
                    />
                  )}
                  <div className="absolute right-2 top-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        course.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {course.published ? '已发布' : '草稿'}
                    </span>
                  </div>
                </div>

                {/* 内容 */}
                <div className="p-4">
                  <h3 className="mb-2 font-semibold">{course.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                    {course.description}
                  </p>

                  <div className="mb-4 flex items-center gap-4 text-xs text-gray-400">
                    <span className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
                      {LEVEL_LABELS[course.level]}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.lessonsCount} 课时
                    </span>
                    {course.totalDuration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.totalDuration} 分钟
                      </span>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    {course.published && (
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="rounded p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="查看"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleEdit(course)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                      className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="删除"
                    >
                      {deletingId === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
