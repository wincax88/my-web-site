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
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=invalid_token', request.url)
      );
    }

    if (subscriber.confirmed) {
      return NextResponse.redirect(
        new URL('/newsletter/already-confirmed', request.url)
      );
    }

    // 确认订阅
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
        confirmToken: null,
      },
    });

    return NextResponse.redirect(new URL('/newsletter/confirmed', request.url));
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    return NextResponse.redirect(
      new URL('/newsletter/error?reason=server_error', request.url)
    );
  }
}
