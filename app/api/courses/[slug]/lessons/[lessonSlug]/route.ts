import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Params = {
  slug: string;
  lessonSlug: string;
};

// 获取课时内容（公开接口）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> | Params }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { slug: courseSlug, lessonSlug } = resolvedParams;

    // 先获取课程
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }

    // 获取当前课时
    const lesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId: course.id,
          slug: lessonSlug,
        },
        published: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: '课时不存在' }, { status: 404 });
    }

    // 获取上一课时和下一课时
    const [prevLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          courseId: course.id,
          published: true,
          order: { lt: lesson.order },
        },
        orderBy: { order: 'desc' },
        select: { slug: true, title: true },
      }),
      prisma.lesson.findFirst({
        where: {
          courseId: course.id,
          published: true,
          order: { gt: lesson.order },
        },
        orderBy: { order: 'asc' },
        select: { slug: true, title: true },
      }),
    ]);

    return NextResponse.json({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      order: lesson.order,
      duration: lesson.duration,
      course: {
        slug: course.slug,
        title: course.title,
      },
      prevLesson,
      nextLesson,
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: '获取课时内容失败' }, { status: 500 });
  }
}
