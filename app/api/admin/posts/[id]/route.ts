import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

// 强制动态渲染，避免构建时静态分析
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30秒超时
export const runtime = 'nodejs';

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // 验证管理员权限
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    // 处理 Next.js 14/15 中 params 可能是 Promise 的情况
    const resolvedParams = await Promise.resolve(params);
    const postId = resolvedParams.id;

    console.log('[GET Post] 获取文章 ID:', postId);

    // 执行数据库查询
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: true,
      },
    });

    console.log('[GET Post] 查询结果:', post ? '找到文章' : '未找到文章');

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      coverImage: post.coverImage,
      published: post.published,
      publishedAt: post.publishedAt?.toISOString() || null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      views: post.views,
      tags: post.tags.map((tag) => tag.name),
    });
  } catch (error) {
    console.error('[GET Post] Error fetching post:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[GET Post] Error details:', { errorMessage, errorStack });

    // 确保返回 JSON 格式
    return NextResponse.json(
      {
        error: '获取文章失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // 验证管理员权限
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    // 处理 Next.js 14/15 中 params 可能是 Promise 的情况
    const resolvedParams = await Promise.resolve(params);
    const postId = resolvedParams.id;

    console.log('[PUT Post] 更新文章 ID:', postId);

    const body = await request.json();
    const { title, slug, description, content, tags, published, coverImage } =
      body;

    // 验证必填字段
    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: '标题、slug和描述不能为空' },
        { status: 400 }
      );
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 如果slug改变，检查新slug是否已被使用
    if (slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: '该slug已存在，请使用其他slug' },
          { status: 400 }
        );
      }
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

    // 更新文章
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        description,
        content: content || null,
        coverImage: coverImage || null,
        published: published ?? false,
        publishedAt:
          published && !existingPost.publishedAt
            ? new Date()
            : existingPost.publishedAt,
        tags: {
          set: tagConnections,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error updating post:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('Error details:', { errorMessage });
    return NextResponse.json(
      {
        error: '更新文章失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // 验证管理员权限
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    // 处理 Next.js 14/15 中 params 可能是 Promise 的情况
    const resolvedParams = await Promise.resolve(params);
    const postId = resolvedParams.id;

    console.log('[DELETE Post] 删除文章 ID:', postId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 删除文章（关联的评论和标签关系会自动处理）
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: '文章已删除' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
