import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

// 有效的分享平台
const VALID_PLATFORMS = ['twitter', 'facebook', 'linkedin', 'weibo', 'copy', 'email'];

// 获取文章分享统计
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    const stats = await prisma.shareStats.findMany({
      where: { postSlug: slug },
      select: {
        platform: true,
        count: true,
      },
    });

    // 转换为对象格式
    const shareStats: Record<string, number> = {};
    let total = 0;

    for (const stat of stats) {
      shareStats[stat.platform] = stat.count;
      total += stat.count;
    }

    return NextResponse.json({
      slug,
      stats: shareStats,
      total,
    });
  } catch (error) {
    console.error('Error fetching share stats:', error);
    return NextResponse.json({ stats: {}, total: 0 });
  }
}

// 记录分享
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { platform } = body;

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: '无效的分享平台' },
        { status: 400 }
      );
    }

    // 更新或创建分享统计
    const stat = await prisma.shareStats.upsert({
      where: {
        postSlug_platform: {
          postSlug: slug,
          platform,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        postSlug: slug,
        platform,
        count: 1,
      },
    });

    return NextResponse.json({
      success: true,
      platform,
      count: stat.count,
    });
  } catch (error) {
    console.error('Error recording share:', error);
    return NextResponse.json(
      { error: '记录分享失败' },
      { status: 500 }
    );
  }
}
