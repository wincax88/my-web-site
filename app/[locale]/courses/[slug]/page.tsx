import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { LEVEL_LABELS, LEVEL_COLORS, CourseLevel } from '@/types/course';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
      lessons: {
        where: { published: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          order: true,
          duration: true,
        },
      },
    },
  });

  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    coverImage: course.coverImage,
    level: course.level as CourseLevel,
    publishedAt: course.publishedAt?.toISOString() || null,
    tags: course.tags.map((tag) => tag.name),
    lessons: course.lessons,
    lessonsCount: course.lessons.length,
    totalDuration: course.lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    ),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: '课程不存在',
    };
  }

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: `${course.title} - 函数志`,
      description: course.description,
      type: 'website',
      url: `${siteUrl}/courses/${course.slug}`,
      images: course.coverImage ? [course.coverImage] : [],
    },
    alternates: {
      canonical: `${siteUrl}/courses/${course.slug}`,
    },
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const firstLesson = course.lessons[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/courses" className="hover:text-blue-600">
          教程
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 左侧：课程信息 */}
        <div className="lg:col-span-2">
          {/* 封面图片 */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-purple-500">
            {course.coverImage && (
              <Image
                src={course.coverImage}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
                unoptimized={course.coverImage.startsWith('http')}
              />
            )}
          </div>

          {/* 课程标题和描述 */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${LEVEL_COLORS[course.level]}`}
              >
                {LEVEL_LABELS[course.level]}
              </span>
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          </div>

          {/* 课程概览 */}
          <div className="mb-8 flex items-center gap-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>{course.lessonsCount} 课时</span>
            </div>
            {course.totalDuration > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
            )}
          </div>

          {/* 开始学习按钮（移动端） */}
          {firstLesson && (
            <div className="mb-8 lg:hidden">
              <Link
                href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                <PlayCircle className="h-5 w-5" />
                开始学习
              </Link>
            </div>
          )}

          {/* 课时列表 */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">课程目录</h2>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {course.lessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  {lesson.duration && (
                    <span className="text-sm text-gray-400">
                      {lesson.duration} 分钟
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：固定侧边栏 */}
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold">课程信息</h3>

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">难度</span>
                <span className="font-medium">
                  {LEVEL_LABELS[course.level]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">课时数</span>
                <span className="font-medium">{course.lessonsCount} 课时</span>
              </div>
              {course.totalDuration > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">总时长</span>
                  <span className="font-medium">
                    {formatDuration(course.totalDuration)}
                  </span>
                </div>
              )}
            </div>

            {firstLesson ? (
              <Link
                href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                <PlayCircle className="h-5 w-5" />
                开始学习
              </Link>
            ) : (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 text-gray-500"
              >
                暂无课时
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
