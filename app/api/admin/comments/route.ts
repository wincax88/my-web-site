import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 获取所有评论（支持筛选）
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status'); // 'pending' | 'approved' | 'all'
    const postId = searchParams.get('postId');

    // 构建查询条件
    const where: {
      approved?: boolean;
      postId?: string;
      parentId?: null;
    } = {};

    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }

    if (postId) {
      where.postId = postId;
    }

    // 只获取顶级评论，回复通过关联查询
    where.parentId = null;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
          replies: {
            include: {
              replies: true, // 支持二级嵌套
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.comment.count({ where }),
    ]);

    // 获取待审核评论总数
    const pendingCount = await prisma.comment.count({
      where: { approved: false },
    });

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        author: comment.author,
        content: comment.content,
        approved: comment.approved,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        post: {
          id: comment.post.id,
          slug: comment.post.slug,
          title: comment.post.title,
        },
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          author: reply.author,
          content: reply.content,
          approved: reply.approved,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString(),
          replies: reply.replies.map((r) => ({
            id: r.id,
            author: r.author,
            content: r.content,
            approved: r.approved,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          })),
        })),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      pendingCount,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: '获取评论列表失败' }, { status: 500 });
  }
}
