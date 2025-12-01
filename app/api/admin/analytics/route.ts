import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    // 获取统计数据
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCourses,
      publishedCourses,
      totalLessons,
      totalComments,
      pendingComments,
      totalTags,
      totalViews,
      topPosts,
      recentComments,
      tagStats,
    ] = await Promise.all([
      // 文章统计
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),

      // 课程统计
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.lesson.count(),

      // 评论统计
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),

      // 标签统计
      prisma.tag.count(),

      // 总浏览量
      prisma.post.aggregate({
        _sum: { views: true },
      }),

      // 热门文章 Top 10
      prisma.post.findMany({
        where: { published: true },
        select: {
          id: true,
          slug: true,
          title: true,
          views: true,
          publishedAt: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { views: 'desc' },
        take: 10,
      }),

      // 最近评论
      prisma.comment.findMany({
        select: {
          id: true,
          author: true,
          content: true,
          approved: true,
          createdAt: true,
          post: {
            select: {
              slug: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // 标签使用统计
      prisma.tag.findMany({
        select: {
          name: true,
          _count: {
            select: {
              posts: true,
              courses: true,
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // 获取最近 7 天的文章发布趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await prisma.post.findMany({
      where: {
        publishedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        publishedAt: true,
      },
    });

    // 按日期分组
    const postsByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      postsByDay[key] = 0;
    }

    recentPosts.forEach((post) => {
      if (post.publishedAt) {
        const key = post.publishedAt.toISOString().split('T')[0];
        if (postsByDay[key] !== undefined) {
          postsByDay[key]++;
        }
      }
    });

    return NextResponse.json({
      overview: {
        posts: {
          total: totalPosts,
          published: publishedPosts,
          draft: draftPosts,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          lessons: totalLessons,
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
          approved: totalComments - pendingComments,
        },
        tags: totalTags,
        totalViews: totalViews._sum.views || 0,
      },
      topPosts: topPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        views: post.views,
        commentsCount: post._count.comments,
        publishedAt: post.publishedAt?.toISOString(),
      })),
      recentComments: recentComments.map((comment) => ({
        id: comment.id,
        author: comment.author,
        content:
          comment.content.substring(0, 100) +
          (comment.content.length > 100 ? '...' : ''),
        approved: comment.approved,
        createdAt: comment.createdAt.toISOString(),
        post: comment.post,
      })),
      tagStats: tagStats.map((tag) => ({
        name: tag.name,
        postsCount: tag._count.posts,
        coursesCount: tag._count.courses,
      })),
      postsByDay: Object.entries(postsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
