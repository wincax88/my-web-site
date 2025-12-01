import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 获取课程的所有课时
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const courseId = resolvedParams.id;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration,
        published: lesson.published,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: '获取课时列表失败' }, { status: 500 });
  }
}

// 创建新课时
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const courseId = resolvedParams.id;
    const body = await request.json();
    const { title, slug, description, content, order, duration, published } =
      body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: '标题、slug和内容不能为空' },
        { status: 400 }
      );
    }

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }

    // 检查slug在该课程中是否已存在
    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
    });

    if (existingLesson) {
      return NextResponse.json(
        { error: '该课程中已存在相同的slug' },
        { status: 400 }
      );
    }

    // 如果没有指定order，自动获取下一个顺序号
    let lessonOrder = order;
    if (lessonOrder === undefined || lessonOrder === null) {
      const maxOrder = await prisma.lesson.aggregate({
        where: { courseId },
        _max: { order: true },
      });
      lessonOrder = (maxOrder._max.order || 0) + 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        description: description || null,
        content,
        order: lessonOrder,
        duration: duration || null,
        published: published ?? false,
        courseId,
      },
    });

    return NextResponse.json(
      {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration,
        published: lesson.published,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lesson:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      {
        error: '创建课时失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
