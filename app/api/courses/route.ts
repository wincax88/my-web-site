import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 获取已发布的课程列表（公开接口）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const level = searchParams.get('level');
    const tag = searchParams.get('tag');

    const where: {
      published: boolean;
      level?: string;
      tags?: { some: { name: string } };
    } = { published: true };

    if (level) {
      where.level = level;
    }

    if (tag) {
      where.tags = { some: { name: tag } };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses: courses.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        level: course.level,
        publishedAt: course.publishedAt?.toISOString() || null,
        tags: course.tags.map((tag) => tag.name),
        lessonsCount: course._count.lessons,
        totalDuration: course.lessons.reduce(
          (sum, lesson) => sum + (lesson.duration || 0),
          0
        ),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: '获取课程列表失败' }, { status: 500 });
  }
}
