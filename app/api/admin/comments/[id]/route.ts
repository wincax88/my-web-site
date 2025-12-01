import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

// 获取单个评论详情
export async function GET(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        parent: {
          select: {
            id: true,
            author: true,
            content: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      approved: comment.approved,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      post: comment.post,
      parent: comment.parent,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        author: reply.author,
        content: reply.content,
        approved: reply.approved,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// 更新评论（审核/编辑）
export async function PUT(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { approved, content } = body;

    // 检查评论是否存在
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }

    // 构建更新数据
    const updateData: { approved?: boolean; content?: string } = {};

    if (typeof approved === 'boolean') {
      updateData.approved = approved;
    }

    if (typeof content === 'string' && content.trim()) {
      updateData.content = content.trim();
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        post: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      approved: comment.approved,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      post: comment.post,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: '更新评论失败' },
      { status: 500 }
    );
  }
}

// 删除评论
export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { id } = await params;

    // 检查评论是否存在
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }

    // 删除评论（级联删除会自动删除所有回复）
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      message: '评论已删除',
      deletedRepliesCount: existingComment._count.replies,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    );
  }
}
