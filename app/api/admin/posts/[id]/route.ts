import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 强制动态渲染，避免构建时静态分析
export const dynamic = 'force-dynamic';

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      published: post.published,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      views: post.views,
      tags: post.tags.map((tag) => tag.name),
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        content: content || null,
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
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.tags.map((tag) => tag.name),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 删除文章（关联的评论和标签关系会自动处理）
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: '文章已删除' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
