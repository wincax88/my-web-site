import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 获取课程详情（公开接口）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

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

    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      level: course.level,
      publishedAt: course.publishedAt?.toISOString() || null,
      tags: course.tags.map((tag) => tag.name),
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.duration,
      })),
      lessonsCount: course.lessons.length,
      totalDuration: course.lessons.reduce(
        (sum, lesson) => sum + (lesson.duration || 0),
        0
      ),
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: '获取课程详情失败' }, { status: 500 });
  }
}
