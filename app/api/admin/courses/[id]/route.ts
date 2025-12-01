import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 获取单个课程详情
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tags: true,
        lessons: {
          orderBy: { order: 'asc' },
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
      published: course.published,
      publishedAt: course.publishedAt?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      tags: course.tags.map((tag) => tag.name),
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration,
        published: lesson.published,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: '获取课程详情失败' }, { status: 500 });
  }
}

// 更新课程
export async function PUT(
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
    const { title, slug, description, coverImage, level, tags, published } =
      body;

    // 检查课程是否存在
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: '课程不存在' }, { status: 404 });
    }

    // 如果修改了slug，检查新slug是否已被使用
    if (slug && slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: '该slug已被其他课程使用' },
          { status: 400 }
        );
      }
    }

    // 处理标签
    let tagConnections: { id: string }[] = [];
    if (tags !== undefined) {
      tagConnections = await Promise.all(
        (tags as string[]).map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName.trim() },
            update: {},
            create: { name: tagName.trim() },
          });
          return { id: tag.id };
        })
      );
    }

    // 更新课程
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(level !== undefined && { level }),
        ...(published !== undefined && {
          published,
          publishedAt:
            published && !existingCourse.published ? new Date() : undefined,
        }),
        ...(tags !== undefined && {
          tags: {
            set: [],
            connect: tagConnections,
          },
        }),
      },
      include: {
        tags: true,
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      level: course.level,
      published: course.published,
      publishedAt: course.publishedAt?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      tags: course.tags.map((tag) => tag.name),
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order: lesson.order,
        published: lesson.published,
      })),
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: '更新课程失败' }, { status: 500 });
  }
}

// 删除课程
export async function DELETE(
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

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: '课程已删除' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: '删除课程失败' }, { status: 500 });
  }
}
