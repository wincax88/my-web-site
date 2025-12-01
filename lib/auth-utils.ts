import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from './auth';

// 获取当前会话
export async function getSession() {
  return await getServerSession(authOptions);
}

// 检查是否已认证
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

// 检查是否是管理员
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'admin';
}

// API 路由认证守卫
export async function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    return handler(request);
  };
}

// API 路由管理员守卫
export async function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    return handler(request);
  };
}

// 简单的认证检查函数（用于 API 路由内部）
export async function requireAuth(): Promise<{
  authenticated: boolean;
  session: any;
  error?: NextResponse;
}> {
  const session = await getSession();

  if (!session?.user) {
    return {
      authenticated: false,
      session: null,
      error: NextResponse.json({ error: '未授权访问' }, { status: 401 }),
    };
  }

  return {
    authenticated: true,
    session,
  };
}

// 管理员认证检查函数
export async function requireAdminAuth(): Promise<{
  authenticated: boolean;
  session: any;
  error?: NextResponse;
}> {
  const session = await getSession();

  if (!session?.user) {
    return {
      authenticated: false,
      session: null,
      error: NextResponse.json({ error: '未授权访问' }, { status: 401 }),
    };
  }

  if (session.user.role !== 'admin') {
    return {
      authenticated: false,
      session,
      error: NextResponse.json({ error: '权限不足' }, { status: 403 }),
    };
  }

  return {
    authenticated: true,
    session,
  };
}
