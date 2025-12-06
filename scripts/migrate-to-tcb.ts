/**
 * 数据迁移脚本：从 PostgreSQL (Neon) 迁移到 TCB MySQL
 *
 * 使用方法：
 * 1. 设置环境变量:
 *    - SOURCE_DATABASE_URL: Neon PostgreSQL 连接字符串
 *    - DATABASE_URL: TCB MySQL 连接字符串
 *
 * 2. 运行脚本:
 *    npx ts-node scripts/migrate-to-tcb.ts
 *
 * 注意：
 * - 确保目标 MySQL 数据库已创建表结构 (运行 prisma db push)
 * - 脚本会清空目标表后再导入数据
 */

import { PrismaClient as SourcePrismaClient } from '@prisma/client';

// 源数据库（PostgreSQL）
const sourceUrl = process.env.SOURCE_DATABASE_URL;
if (!sourceUrl) {
  console.error('请设置 SOURCE_DATABASE_URL 环境变量');
  process.exit(1);
}

// 目标数据库（MySQL）- 使用默认的 DATABASE_URL
const targetUrl = process.env.DATABASE_URL;
if (!targetUrl) {
  console.error('请设置 DATABASE_URL 环境变量');
  process.exit(1);
}

// 创建源数据库客户端
// 注意：这里需要动态配置，因为 Prisma 默认使用 DATABASE_URL
const sourcePrisma = new SourcePrismaClient({
  datasources: {
    db: {
      url: sourceUrl,
    },
  },
});

// 目标数据库使用默认连接
const targetPrisma = new SourcePrismaClient();

async function migrateData() {
  console.log('开始数据迁移...\n');

  try {
    // 1. 迁移标签
    console.log('📦 迁移标签 (Tag)...');
    const tags = await sourcePrisma.tag.findMany();
    console.log(`  找到 ${tags.length} 个标签`);

    if (tags.length > 0) {
      await targetPrisma.tag.deleteMany();
      for (const tag of tags) {
        await targetPrisma.tag.create({ data: tag });
      }
      console.log(`  ✅ 标签迁移完成`);
    }

    // 2. 迁移文章（不包含关联）
    console.log('\n📝 迁移文章 (Post)...');
    const posts = await sourcePrisma.post.findMany({
      include: { tags: true },
    });
    console.log(`  找到 ${posts.length} 篇文章`);

    if (posts.length > 0) {
      await targetPrisma.post.deleteMany();
      for (const post of posts) {
        const { tags: postTags, ...postData } = post;
        await targetPrisma.post.create({
          data: {
            ...postData,
            tags: {
              connect: postTags.map((t) => ({ id: t.id })),
            },
          },
        });
      }
      console.log(`  ✅ 文章迁移完成`);
    }

    // 3. 迁移评论
    console.log('\n💬 迁移评论 (Comment)...');
    const comments = await sourcePrisma.comment.findMany({
      orderBy: { createdAt: 'asc' }, // 确保父评论先导入
    });
    console.log(`  找到 ${comments.length} 条评论`);

    if (comments.length > 0) {
      await targetPrisma.comment.deleteMany();
      // 先导入没有父评论的
      const rootComments = comments.filter((c) => !c.parentId);
      const replyComments = comments.filter((c) => c.parentId);

      for (const comment of rootComments) {
        await targetPrisma.comment.create({ data: comment });
      }
      for (const comment of replyComments) {
        await targetPrisma.comment.create({ data: comment });
      }
      console.log(`  ✅ 评论迁移完成`);
    }

    // 4. 迁移课程
    console.log('\n📚 迁移课程 (Course)...');
    const courses = await sourcePrisma.course.findMany({
      include: { tags: true },
    });
    console.log(`  找到 ${courses.length} 个课程`);

    if (courses.length > 0) {
      await targetPrisma.course.deleteMany();
      for (const course of courses) {
        const { tags: courseTags, ...courseData } = course;
        await targetPrisma.course.create({
          data: {
            ...courseData,
            tags: {
              connect: courseTags.map((t) => ({ id: t.id })),
            },
          },
        });
      }
      console.log(`  ✅ 课程迁移完成`);
    }

    // 5. 迁移课时
    console.log('\n📖 迁移课时 (Lesson)...');
    const lessons = await sourcePrisma.lesson.findMany();
    console.log(`  找到 ${lessons.length} 个课时`);

    if (lessons.length > 0) {
      await targetPrisma.lesson.deleteMany();
      for (const lesson of lessons) {
        await targetPrisma.lesson.create({ data: lesson });
      }
      console.log(`  ✅ 课时迁移完成`);
    }

    // 6. 迁移学习进度
    console.log('\n📊 迁移学习进度 (LessonProgress)...');
    const progress = await sourcePrisma.lessonProgress.findMany();
    console.log(`  找到 ${progress.length} 条进度记录`);

    if (progress.length > 0) {
      await targetPrisma.lessonProgress.deleteMany();
      for (const p of progress) {
        await targetPrisma.lessonProgress.create({ data: p });
      }
      console.log(`  ✅ 学习进度迁移完成`);
    }

    // 7. 迁移订阅者
    console.log('\n📧 迁移订阅者 (Subscriber)...');
    const subscribers = await sourcePrisma.subscriber.findMany();
    console.log(`  找到 ${subscribers.length} 个订阅者`);

    if (subscribers.length > 0) {
      await targetPrisma.subscriber.deleteMany();
      for (const sub of subscribers) {
        await targetPrisma.subscriber.create({ data: sub });
      }
      console.log(`  ✅ 订阅者迁移完成`);
    }

    // 8. 迁移分享统计
    console.log('\n📈 迁移分享统计 (ShareStats)...');
    const shareStats = await sourcePrisma.shareStats.findMany();
    console.log(`  找到 ${shareStats.length} 条分享记录`);

    if (shareStats.length > 0) {
      await targetPrisma.shareStats.deleteMany();
      for (const stat of shareStats) {
        await targetPrisma.shareStats.create({ data: stat });
      }
      console.log(`  ✅ 分享统计迁移完成`);
    }

    console.log('\n🎉 数据迁移完成！');
    console.log('\n⚠️  注意：图片文件需要单独迁移，请运行 migrate-media.ts');
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

migrateData().catch((error) => {
  console.error(error);
  process.exit(1);
});
