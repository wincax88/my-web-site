import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制动态渲染，避免构建时静态分析
export const dynamic = 'force-dynamic';

// 获取所有文章
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const where = includeDrafts ? {} : { published: true };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          tags: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        published: post.published,
        publishedAt: post.publishedAt?.toISOString() || null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        views: post.views,
        tags: post.tags.map((tag) => tag.name),
        commentsCount: post._count.comments,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      {
        error: '获取文章列表失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, content, tags, published } = body;

    // 验证必填字段
    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: '标题、slug和描述不能为空' },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: '该slug已存在，请使用其他slug' },
        { status: 400 }
      );
    }

    // 处理标签
    const tagConnections = tags
      ? await Promise.all(
          (tags as string[]).map(async (tagName: string) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName.trim() },
              update: {},
              create: { name: tagName.trim() },
            });
            return { id: tag.id };
          })
        )
      : [];

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        description,
        content: content || null,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(
      {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        published: post.published,
        publishedAt: post.publishedAt?.toISOString() || null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        tags: post.tags.map((tag) => tag.name),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('Error details:', { errorMessage });
    return NextResponse.json(
      {
        error: '创建文章失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
