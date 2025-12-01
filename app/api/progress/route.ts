import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 获取学习进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const courseSlug = searchParams.get('courseSlug');

    if (!visitorId) {
      return NextResponse.json({ error: '缺少visitorId' }, { status: 400 });
    }

    if (courseSlug) {
      // 获取特定课程的进度
      const course = await prisma.course.findUnique({
        where: { slug: courseSlug, published: true },
        include: {
          lessons: {
            where: { published: true },
            select: { id: true },
          },
        },
      });

      if (!course) {
        return NextResponse.json({ error: '课程不存在' }, { status: 404 });
      }

      const lessonIds = course.lessons.map((l) => l.id);
      const progress = await prisma.lessonProgress.findMany({
        where: {
          visitorId,
          lessonId: { in: lessonIds },
        },
      });

      const lessonProgress: Record<
        string,
        { completed: boolean; progress: number }
      > = {};
      let completedCount = 0;

      for (const p of progress) {
        lessonProgress[p.lessonId] = {
          completed: p.completed,
          progress: p.progress,
        };
        if (p.completed) completedCount++;
      }

      return NextResponse.json({
        courseId: course.id,
        completedLessons: completedCount,
        totalLessons: lessonIds.length,
        percentage:
          lessonIds.length > 0
            ? Math.round((completedCount / lessonIds.length) * 100)
            : 0,
        lessonProgress,
      });
    } else {
      // 获取所有课程的进度概览
      const allProgress = await prisma.lessonProgress.findMany({
        where: { visitorId },
        include: {
          lesson: {
            select: {
              courseId: true,
            },
          },
        },
      });

      // 按课程分组
      const courseProgress: Record<
        string,
        { completed: number; total: number }
      > = {};
      for (const p of allProgress) {
        const courseId = p.lesson.courseId;
        if (!courseProgress[courseId]) {
          courseProgress[courseId] = { completed: 0, total: 0 };
        }
        courseProgress[courseId].total++;
        if (p.completed) {
          courseProgress[courseId].completed++;
        }
      }

      return NextResponse.json({ courseProgress });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: '获取进度失败' }, { status: 500 });
  }
}

// 更新学习进度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId, lessonId, completed, progress } = body;

    if (!visitorId || !lessonId) {
      return NextResponse.json(
        { error: 'visitorId和lessonId不能为空' },
        { status: 400 }
      );
    }

    // 验证课时存在且已发布
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, published: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: '课时不存在' }, { status: 404 });
    }

    // 更新或创建进度记录
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        visitorId_lessonId: {
          visitorId,
          lessonId,
        },
      },
      update: {
        ...(completed !== undefined && { completed }),
        ...(progress !== undefined && { progress: Math.min(100, progress) }),
      },
      create: {
        visitorId,
        lessonId,
        completed: completed ?? false,
        progress: progress ?? 0,
      },
    });

    return NextResponse.json({
      lessonId: lessonProgress.lessonId,
      completed: lessonProgress.completed,
      progress: lessonProgress.progress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: '更新进度失败' }, { status: 500 });
  }
}
