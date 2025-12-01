import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 批量操作评论
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请选择要操作的评论' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'approve':
        result = await prisma.comment.updateMany({
          where: { id: { in: ids } },
          data: { approved: true },
        });
        return NextResponse.json({
          message: `已批准 ${result.count} 条评论`,
          count: result.count,
        });

      case 'reject':
        result = await prisma.comment.updateMany({
          where: { id: { in: ids } },
          data: { approved: false },
        });
        return NextResponse.json({
          message: `已拒绝 ${result.count} 条评论`,
          count: result.count,
        });

      case 'delete':
        result = await prisma.comment.deleteMany({
          where: { id: { in: ids } },
        });
        return NextResponse.json({
          message: `已删除 ${result.count} 条评论`,
          count: result.count,
        });

      default:
        return NextResponse.json(
          { error: '无效的操作类型' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error batch operation:', error);
    return NextResponse.json(
      { error: '批量操作失败' },
      { status: 500 }
    );
  }
}
