import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// 获取所有课程
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const where = includeDrafts ? {} : { published: true };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          tags: true,
          _count: {
            select: {
              lessons: true,
            },
          },
          lessons: {
            select: {
              duration: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses: courses.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        level: course.level,
        published: course.published,
        publishedAt: course.publishedAt?.toISOString() || null,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        tags: course.tags.map((tag) => tag.name),
        lessonsCount: course._count.lessons,
        totalDuration: course.lessons.reduce(
          (sum, lesson) => sum + (lesson.duration || 0),
          0
        ),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: '获取课程列表失败' }, { status: 500 });
  }
}

// 创建新课程
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { title, slug, description, coverImage, level, tags, published } =
      body;

    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: '标题、slug和描述不能为空' },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
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

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        coverImage: coverImage || null,
        level: level || 'beginner',
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
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        level: course.level,
        published: course.published,
        publishedAt: course.publishedAt?.toISOString() || null,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        tags: course.tags.map((tag) => tag.name),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      {
        error: '创建课程失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
