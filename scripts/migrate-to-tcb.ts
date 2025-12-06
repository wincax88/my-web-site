/**
 * 数据迁移脚本：从 PostgreSQL (Neon) 迁移到 TCB MySQL
 *
 * 使用方法：
 * 1. 安装依赖: npm install pg --save-dev
 * 2. 设置环境变量:
 *    - SOURCE_DATABASE_URL: Neon PostgreSQL 连接字符串
 *    - DATABASE_URL: TCB MySQL 连接字符串 (mysql://...)
 *
 * 3. 运行脚本:
 *    npx ts-node scripts/migrate-to-tcb.ts
 *
 * 注意：
 * - 确保目标 MySQL 数据库已创建表结构 (运行 prisma db push)
 * - 脚本会清空目标表后再导入数据
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// 获取必需的环境变量
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`请设置 ${name} 环境变量`);
    process.exit(1);
  }
  return value;
}

// 源数据库（PostgreSQL）
const sourceUrl = getRequiredEnv('SOURCE_DATABASE_URL');

// 目标数据库（MySQL）
const targetUrl = getRequiredEnv('DATABASE_URL');
if (!targetUrl.startsWith('mysql://')) {
  console.error('请设置 DATABASE_URL 环境变量为 MySQL 连接字符串');
  console.error('例如: DATABASE_URL="mysql://user:pass@host:3306/db"');
  process.exit(1);
}

// PostgreSQL 源数据库连接
const pgPool = new Pool({ connectionString: sourceUrl });

// MySQL 目标数据库（使用 Prisma）
const prisma = new PrismaClient();

async function migrateData() {
  console.log('开始数据迁移...\n');
  console.log('源数据库 (PostgreSQL):', sourceUrl.replace(/:[^:@]+@/, ':***@'));
  console.log('目标数据库 (MySQL):', targetUrl.replace(/:[^:@]+@/, ':***@'));
  console.log('');

  try {
    // 1. 迁移标签
    console.log('📦 迁移标签 (Tag)...');
    const { rows: tags } = await pgPool.query('SELECT * FROM "Tag"');
    console.log(`  找到 ${tags.length} 个标签`);

    if (tags.length > 0) {
      await prisma.tag.deleteMany();
      for (const tag of tags) {
        await prisma.tag.create({
          data: {
            id: tag.id,
            name: tag.name,
          },
        });
      }
      console.log(`  ✅ 标签迁移完成`);
    }

    // 2. 迁移文章
    console.log('\n📝 迁移文章 (Post)...');
    const { rows: posts } = await pgPool.query('SELECT * FROM "Post"');
    console.log(`  找到 ${posts.length} 篇文章`);

    if (posts.length > 0) {
      // 获取文章-标签关联
      const { rows: postTags } = await pgPool.query('SELECT * FROM "_PostTags"');

      await prisma.post.deleteMany();
      for (const post of posts) {
        const tagIds = postTags
          .filter((pt: { A: string }) => pt.A === post.id)
          .map((pt: { B: string }) => ({ id: pt.B }));

        await prisma.post.create({
          data: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            content: post.content,
            coverImage: post.coverImage,
            published: post.published,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            views: post.views || 0,
            likes: post.likes || 0,
            tags: {
              connect: tagIds,
            },
          },
        });
      }
      console.log(`  ✅ 文章迁移完成`);
    }

    // 3. 迁移评论
    console.log('\n💬 迁移评论 (Comment)...');
    const { rows: comments } = await pgPool.query(
      'SELECT * FROM "Comment" ORDER BY "createdAt" ASC'
    );
    console.log(`  找到 ${comments.length} 条评论`);

    if (comments.length > 0) {
      await prisma.comment.deleteMany();
      // 先导入没有父评论的
      const rootComments = comments.filter((c) => !c.parentId);
      const replyComments = comments.filter((c) => c.parentId);

      for (const comment of rootComments) {
        await prisma.comment.create({
          data: {
            id: comment.id,
            postId: comment.postId,
            author: comment.author,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            approved: comment.approved,
            parentId: null,
          },
        });
      }
      for (const comment of replyComments) {
        await prisma.comment.create({
          data: {
            id: comment.id,
            postId: comment.postId,
            author: comment.author,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            approved: comment.approved,
            parentId: comment.parentId,
          },
        });
      }
      console.log(`  ✅ 评论迁移完成`);
    }

    // 4. 迁移课程
    console.log('\n📚 迁移课程 (Course)...');
    const { rows: courses } = await pgPool.query('SELECT * FROM "Course"');
    console.log(`  找到 ${courses.length} 个课程`);

    if (courses.length > 0) {
      const { rows: courseTags } = await pgPool.query('SELECT * FROM "_CourseTags"');

      await prisma.course.deleteMany();
      for (const course of courses) {
        const tagIds = courseTags
          .filter((ct: { A: string }) => ct.A === course.id)
          .map((ct: { B: string }) => ({ id: ct.B }));

        await prisma.course.create({
          data: {
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description,
            coverImage: course.coverImage,
            level: course.level || 'beginner',
            published: course.published,
            publishedAt: course.publishedAt,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            tags: {
              connect: tagIds,
            },
          },
        });
      }
      console.log(`  ✅ 课程迁移完成`);
    }

    // 5. 迁移课时
    console.log('\n📖 迁移课时 (Lesson)...');
    const { rows: lessons } = await pgPool.query('SELECT * FROM "Lesson"');
    console.log(`  找到 ${lessons.length} 个课时`);

    if (lessons.length > 0) {
      await prisma.lesson.deleteMany();
      for (const lesson of lessons) {
        await prisma.lesson.create({
          data: {
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            order: lesson.order || 0,
            duration: lesson.duration,
            published: lesson.published,
            courseId: lesson.courseId,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt,
          },
        });
      }
      console.log(`  ✅ 课时迁移完成`);
    }

    // 6. 迁移学习进度
    console.log('\n📊 迁移学习进度 (LessonProgress)...');
    const { rows: progress } = await pgPool.query('SELECT * FROM "LessonProgress"');
    console.log(`  找到 ${progress.length} 条进度记录`);

    if (progress.length > 0) {
      await prisma.lessonProgress.deleteMany();
      for (const p of progress) {
        await prisma.lessonProgress.create({
          data: {
            visitorId: p.visitorId,
            lessonId: p.lessonId,
            completed: p.completed,
            progress: p.progress || 0,
            updatedAt: p.updatedAt,
          },
        });
      }
      console.log(`  ✅ 学习进度迁移完成`);
    }

    // 7. 迁移订阅者
    console.log('\n📧 迁移订阅者 (Subscriber)...');
    const { rows: subscribers } = await pgPool.query('SELECT * FROM "Subscriber"');
    console.log(`  找到 ${subscribers.length} 个订阅者`);

    if (subscribers.length > 0) {
      await prisma.subscriber.deleteMany();
      for (const sub of subscribers) {
        await prisma.subscriber.create({
          data: {
            id: sub.id,
            email: sub.email,
            name: sub.name,
            confirmed: sub.confirmed,
            confirmToken: sub.confirmToken,
            unsubscribeToken: sub.unsubscribeToken,
            createdAt: sub.createdAt,
            confirmedAt: sub.confirmedAt,
            unsubscribedAt: sub.unsubscribedAt,
          },
        });
      }
      console.log(`  ✅ 订阅者迁移完成`);
    }

    // 8. 迁移分享统计
    console.log('\n📈 迁移分享统计 (ShareStats)...');
    const { rows: shareStats } = await pgPool.query('SELECT * FROM "ShareStats"');
    console.log(`  找到 ${shareStats.length} 条分享记录`);

    if (shareStats.length > 0) {
      await prisma.shareStats.deleteMany();
      for (const stat of shareStats) {
        await prisma.shareStats.create({
          data: {
            id: stat.id,
            postSlug: stat.postSlug,
            platform: stat.platform,
            count: stat.count || 0,
            createdAt: stat.createdAt,
            updatedAt: stat.updatedAt,
          },
        });
      }
      console.log(`  ✅ 分享统计迁移完成`);
    }

    console.log('\n🎉 数据迁移完成！');
    console.log('\n⚠️  注意：图片文件需要单独迁移，请运行 migrate-media.ts');
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    throw error;
  } finally {
    await pgPool.end();
    await prisma.$disconnect();
  }
}

migrateData().catch((error) => {
  console.error(error);
  process.exit(1);
});
