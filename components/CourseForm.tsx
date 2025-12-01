'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Loader2,
  X,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { CourseLevel, LEVEL_LABELS } from '@/types/course';

interface Lesson {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  duration?: number | null;
  published: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  level: CourseLevel;
  published: boolean;
  tags: string[];
  lessons?: Lesson[];
}

interface CourseFormProps {
  course?: Course | null;
  onClose: () => void;
  onSave: () => void;
}

export function CourseForm({ course, onClose, onSave }: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    coverImage: '',
    level: 'beginner' as CourseLevel,
    tags: '',
    published: false,
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        slug: course.slug,
        description: course.description,
        coverImage: course.coverImage || '',
        level: course.level,
        tags: course.tags.join(', '),
        published: course.published,
      });
      if (course.lessons) {
        setLessons(
          course.lessons.map((l) => ({
            ...l,
            description: l.description || '',
            content: l.content || '',
            duration: l.duration ?? null,
          }))
        );
      }
    }
  }, [course]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      setFormData((prev) => ({
        ...prev,
        coverImage: data.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const addLesson = () => {
    const newOrder =
      lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;
    const newLesson: Lesson = {
      slug: '',
      title: '',
      description: '',
      content: '',
      order: newOrder,
      duration: null,
      published: false,
      isNew: true,
    };
    setLessons([...lessons, newLesson]);
    setExpandedLesson(lessons.length);
  };

  const updateLesson = (index: number, updates: Partial<Lesson>) => {
    setLessons((prev) =>
      prev.map((lesson, i) => (i === index ? { ...lesson, ...updates } : lesson))
    );
  };

  const deleteLesson = (index: number) => {
    const lesson = lessons[index];
    if (lesson.id) {
      // 已存在的课时标记为删除
      setLessons((prev) =>
        prev.map((l, i) => (i === index ? { ...l, isDeleted: true } : l))
      );
    } else {
      // 新建的课时直接移除
      setLessons((prev) => prev.filter((_, i) => i !== index));
    }
    setExpandedLesson(null);
  };

  const moveLessonUp = (index: number) => {
    if (index === 0) return;
    const newLessons = [...lessons];
    [newLessons[index - 1], newLessons[index]] = [
      newLessons[index],
      newLessons[index - 1],
    ];
    // 更新 order
    newLessons.forEach((l, i) => {
      l.order = i + 1;
    });
    setLessons(newLessons);
  };

  const moveLessonDown = (index: number) => {
    if (index === lessons.length - 1) return;
    const newLessons = [...lessons];
    [newLessons[index], newLessons[index + 1]] = [
      newLessons[index + 1],
      newLessons[index],
    ];
    // 更新 order
    newLessons.forEach((l, i) => {
      l.order = i + 1;
    });
    setLessons(newLessons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // 保存课程
      const courseData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        coverImage: formData.coverImage || null,
        level: formData.level,
        tags,
        published: formData.published,
      };

      let courseId = course?.id;

      if (course) {
        // 更新课程
        const response = await fetch(`/api/admin/courses/${course.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '更新课程失败');
        }
      } else {
        // 创建课程
        const response = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '创建课程失败');
        }

        const data = await response.json();
        courseId = data.id;
      }

      // 保存课时
      for (const lesson of lessons) {
        if (lesson.isDeleted && lesson.id) {
          // 删除课时
          await fetch(
            `/api/admin/courses/${courseId}/lessons/${lesson.id}`,
            { method: 'DELETE' }
          );
        } else if (lesson.isNew && !lesson.isDeleted) {
          // 创建新课时
          if (lesson.title && lesson.slug && lesson.content) {
            await fetch(`/api/admin/courses/${courseId}/lessons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: lesson.title,
                slug: lesson.slug,
                description: lesson.description,
                content: lesson.content,
                order: lesson.order,
                duration: lesson.duration,
                published: lesson.published,
              }),
            });
          }
        } else if (lesson.id && !lesson.isDeleted) {
          // 更新已有课时
          await fetch(
            `/api/admin/courses/${courseId}/lessons/${lesson.id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: lesson.title,
                slug: lesson.slug,
                description: lesson.description,
                content: lesson.content,
                order: lesson.order,
                duration: lesson.duration,
                published: lesson.published,
              }),
            }
          );
        }
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const activeLessons = lessons.filter((l) => !l.isDeleted);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {course ? '编辑课程' : '新建课程'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 课程基本信息 */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h3 className="font-semibold">基本信息</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">描述</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">难度</label>
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  level: e.target.value as CourseLevel,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">标签</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="用逗号分隔"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>

        {/* 封面图片 */}
        <div>
          <label className="mb-1 block text-sm font-medium">封面图片</label>
          <div className="flex items-start gap-4">
            {formData.coverImage && (
              <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-gray-200">
                <Image
                  src={formData.coverImage}
                  alt="封面"
                  fill
                  className="object-cover"
                  unoptimized={formData.coverImage.startsWith('http')}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, coverImage: '' }))
                  }
                  className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                上传图片
              </button>
            </div>
          </div>
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
          <label htmlFor="published" className="text-sm">
            发布课程
          </label>
        </div>
      </div>

      {/* 课时列表 */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">课时列表 ({activeLessons.length})</h3>
          <button
            type="button"
            onClick={addLesson}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            添加课时
          </button>
        </div>

        {activeLessons.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            暂无课时，点击上方按钮添加
          </p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              if (lesson.isDeleted) return null;
              const isExpanded = expandedLesson === index;

              return (
                <div
                  key={lesson.id || `new-${index}`}
                  className="rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {/* 课时标题栏 */}
                  <div
                    className="flex cursor-pointer items-center gap-2 p-3"
                    onClick={() =>
                      setExpandedLesson(isExpanded ? null : index)
                    }
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium">
                      {lesson.title || '未命名课时'}
                    </span>
                    {lesson.isNew && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-600">
                        新建
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLessonUp(index);
                        }}
                        disabled={index === 0}
                        className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLessonDown(index);
                        }}
                        disabled={
                          index === lessons.filter((l) => !l.isDeleted).length - 1
                        }
                        className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个课时吗？')) {
                            deleteLesson(index);
                          }
                        }}
                        className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 课时编辑表单 */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            标题
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(index, {
                                title: e.target.value,
                                slug:
                                  lesson.slug || generateSlug(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={lesson.slug}
                            onChange={(e) =>
                              updateLesson(index, { slug: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          描述
                        </label>
                        <input
                          type="text"
                          value={lesson.description}
                          onChange={(e) =>
                            updateLesson(index, { description: e.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          内容 (支持 MDX)
                        </label>
                        <textarea
                          value={lesson.content}
                          onChange={(e) =>
                            updateLesson(index, { content: e.target.value })
                          }
                          rows={10}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            时长 (分钟)
                          </label>
                          <input
                            type="number"
                            value={lesson.duration || ''}
                            onChange={(e) =>
                              updateLesson(index, {
                                duration: e.target.value
                                  ? parseInt(e.target.value)
                                  : null,
                              })
                            }
                            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`lesson-published-${index}`}
                            checked={lesson.published}
                            onChange={(e) =>
                              updateLesson(index, {
                                published: e.target.checked,
                              })
                            }
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor={`lesson-published-${index}`}
                            className="text-sm"
                          >
                            发布课时
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          保存
        </button>
      </div>
    </form>
  );
}
