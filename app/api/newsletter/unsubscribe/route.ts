import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=missing_token', request.url)
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=invalid_token', request.url)
      );
    }

    if (subscriber.unsubscribedAt) {
      return NextResponse.redirect(
        new URL('/newsletter/already-unsubscribed', request.url)
      );
    }

    // 取消订阅
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', request.url)
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.redirect(
      new URL('/newsletter/error?reason=server_error', request.url)
    );
  }
}
