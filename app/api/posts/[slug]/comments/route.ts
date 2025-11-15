import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制动态渲染，避免构建时静态分析
export const dynamic = 'force-dynamic';

// 简单的内存限流（生产环境应使用 Redis 等）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1分钟
    return true;
  }

  if (limit.count >= 5) {
    // 每分钟最多5条评论
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 限流检查
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { author, content } = body;

    // 验证输入
    if (!author || !content) {
      return NextResponse.json(
        { error: '作者和内容不能为空' },
        { status: 400 }
      );
    }

    if (author.length > 100) {
      return NextResponse.json({ error: '作者名称过长' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: '评论内容过长' }, { status: 400 });
    }

    // 查找或创建文章（基于 slug）
    let post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      // 如果文章不存在，创建一个占位记录
      post = await prisma.post.create({
        data: {
          slug,
          title: slug,
          description: '',
          published: false,
        },
      });
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        author: author.trim(),
        content: content.trim(),
        approved: false, // 默认需要审核
      },
    });

    return NextResponse.json(
      {
        id: comment.id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
        message: '评论已提交，等待审核',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({
      comments: post.comments.map((comment) => ({
        id: comment.id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}
