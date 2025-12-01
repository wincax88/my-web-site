import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// 简单的邮箱验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查是否已订阅
    const existing = await prisma.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.confirmed && !existing.unsubscribedAt) {
        return NextResponse.json({ error: '该邮箱已订阅' }, { status: 400 });
      }

      // 如果之前退订了，重新激活
      if (existing.unsubscribedAt) {
        const confirmToken = randomBytes(32).toString('hex');
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: {
            confirmed: false,
            confirmToken,
            unsubscribedAt: null,
            name: name || existing.name,
          },
        });

        // TODO: 发送确认邮件
        // await sendConfirmationEmail(email, confirmToken);

        return NextResponse.json({
          success: true,
          message: '订阅请求已收到，请检查邮箱确认订阅',
          needsConfirmation: true,
        });
      }

      // 如果未确认，重新发送确认邮件
      if (!existing.confirmed) {
        // TODO: 重新发送确认邮件
        return NextResponse.json({
          success: true,
          message: '确认邮件已重新发送，请检查邮箱',
          needsConfirmation: true,
        });
      }
    }

    // 创建新订阅者
    const confirmToken = randomBytes(32).toString('hex');
    await prisma.subscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        confirmToken,
      },
    });

    // TODO: 发送确认邮件
    // await sendConfirmationEmail(email, confirmToken);

    return NextResponse.json({
      success: true,
      message: '订阅请求已收到，请检查邮箱确认订阅',
      needsConfirmation: true,
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: '订阅失败，请稍后重试' },
      { status: 500 }
    );
  }
}
