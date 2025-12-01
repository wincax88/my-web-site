import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

// 获取单个标签
export async function GET(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
          },
          take: 10,
        },
        courses: {
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
          },
          take: 10,
        },
        _count: {
          select: {
            posts: true,
            courses: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: tag.id,
      name: tag.name,
      postsCount: tag._count.posts,
      coursesCount: tag._count.courses,
      posts: tag.posts,
      courses: tag.courses,
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 });
  }
}

// 更新标签
export async function PUT(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // 检查标签是否存在
    const existing = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 检查新名称是否与其他标签重复
    const duplicate = await prisma.tag.findFirst({
      where: {
        name: trimmedName,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ error: '该标签名称已存在' }, { status: 400 });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: trimmedName },
      include: {
        _count: {
          select: {
            posts: true,
            courses: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: tag.id,
      name: tag.name,
      postsCount: tag._count.posts,
      coursesCount: tag._count.courses,
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: '更新标签失败' }, { status: 500 });
  }
}

// 删除标签
export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;

    // 检查标签是否存在
    const existing = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            courses: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // 删除标签（会自动断开与文章/课程的关联）
    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      message: '标签已删除',
      affectedPosts: existing._count.posts,
      affectedCourses: existing._count.courses,
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: '删除标签失败' }, { status: 500 });
  }
}
