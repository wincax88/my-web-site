import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

// 获取文章浏览量
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { views: true },
    });

    if (!post) {
      return NextResponse.json({ views: 0 });
    }

    return NextResponse.json({ views: post.views });
  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json({ views: 0 });
  }
}

// 增加文章浏览量
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // 尝试更新现有文章的浏览量
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      // 如果文章不存在（可能是 MDX 文件未同步到数据库），返回成功但不增加
      return NextResponse.json({ views: 0 });
    }

    // 增加浏览量
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ views: updatedPost.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ views: 0 });
  }
}
