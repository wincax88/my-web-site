import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

// 获取文章点赞数
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { likes: true },
    });

    if (!post) {
      return NextResponse.json({ likes: 0 });
    }

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ likes: 0 });
  }
}

// 点赞/取消点赞文章
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'like'; // 'like' or 'unlike'

    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ likes: 0 });
    }

    // 根据 action 决定是增加还是减少点赞数
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        likes:
          action === 'unlike'
            ? { decrement: post.likes > 0 ? 1 : 0 }
            : { increment: 1 },
      },
      select: { likes: true },
    });

    return NextResponse.json({ likes: updatedPost.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json({ likes: 0 });
  }
}
