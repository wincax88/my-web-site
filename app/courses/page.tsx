import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Clock, BookOpen, GraduationCap } from 'lucide-react';
import { LEVEL_LABELS, LEVEL_COLORS, CourseLevel } from '@/types/course';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

export const metadata: Metadata = {
  title: '教程',
  description:
    '系统化的编程教程和课程，帮助您从零开始学习 Web 开发、前端技术和后端开发。',
  openGraph: {
    title: '教程 - 函数志',
    description:
      '系统化的编程教程和课程，帮助您从零开始学习 Web 开发、前端技术和后端开发。',
    type: 'website',
    url: `${siteUrl}/courses`,
  },
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
};

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      tags: true,
      _count: {
        select: {
          lessons: {
            where: { published: true },
          },
        },
      },
      lessons: {
        where: { published: true },
        select: {
          duration: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    coverImage: course.coverImage,
    level: course.level as CourseLevel,
    publishedAt: course.publishedAt?.toISOString() || null,
    tags: course.tags.map((tag) => tag.name),
    lessonsCount: course._count.lessons,
    totalDuration: course.lessons.reduce(
      (sum, lesson) => sum + (lesson.duration || 0),
      0
    ),
  }));
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">教程</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          系统化的编程教程和课程，帮助您从零开始学习 Web
          开发、前端技术和后端开发。
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="py-12 text-center">
          <GraduationCap className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            教程内容即将上线，敬请期待！
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              {/* 封面图片 */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                {course.coverImage && (
                  <Image
                    src={course.coverImage}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={course.coverImage.startsWith('http')}
                  />
                )}
                {/* 难度标签 */}
                <div className="absolute right-3 top-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${LEVEL_COLORS[course.level]}`}
                  >
                    {LEVEL_LABELS[course.level]}
                  </span>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-5">
                <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {course.title}
                </h2>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {course.description}
                </p>

                {/* 标签 */}
                {course.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 课程信息 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessonsCount} 课时</span>
                  </div>
                  {course.totalDuration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(course.totalDuration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
