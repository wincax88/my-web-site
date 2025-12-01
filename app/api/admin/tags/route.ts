import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 获取所有标签
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const search = searchParams.get('search') || '';

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true,
              courses: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.tag.count({ where }),
    ]);

    return NextResponse.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        postsCount: tag._count.posts,
        coursesCount: tag._count.courses,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: '获取标签列表失败' }, { status: 500 });
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 });
    }

    const trimmedName = name.trim();

    // 检查是否已存在
    const existing = await prisma.tag.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json({ error: '该标签已存在' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: { name: trimmedName },
    });

    return NextResponse.json(
      {
        id: tag.id,
        name: tag.name,
        postsCount: 0,
        coursesCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: '创建标签失败' }, { status: 500 });
  }
}
