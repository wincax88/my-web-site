import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

type Params = {
  id: string;
  lessonId: string;
};

// 获取单个课时
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> | Params }
) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const { lessonId } = resolvedParams;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: '课时不存在' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: '获取课时详情失败' }, { status: 500 });
  }
}

// 更新课时
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> | Params }
) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const { id: courseId, lessonId } = resolvedParams;
    const body = await request.json();
    const { title, slug, description, content, order, duration, published } =
      body;

    // 检查课时是否存在
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return NextResponse.json({ error: '课时不存在' }, { status: 404 });
    }

    // 如果修改了slug，检查新slug在该课程中是否已存在
    if (slug && slug !== existingLesson.slug) {
      const slugExists = await prisma.lesson.findUnique({
        where: {
          courseId_slug: {
            courseId,
            slug,
          },
        },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: '该课程中已存在相同的slug' },
          { status: 400 }
        );
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order }),
        ...(duration !== undefined && { duration }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: '更新课时失败' }, { status: 500 });
  }
}

// 删除课时
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> | Params }
) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const { lessonId } = resolvedParams;

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ message: '课时已删除' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: '删除课时失败' }, { status: 500 });
  }
}
