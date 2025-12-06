/**
 * 媒体文件迁移脚本：从 Vercel Blob 迁移到 TCB 云存储
 *
 * 使用方法：
 * 1. 设置环境变量:
 *    - DATABASE_URL: TCB MySQL 连接字符串
 *    - TCB_ENV_ID: TCB 环境 ID
 *    - TCB_SECRET_ID: TCB SecretId
 *    - TCB_SECRET_KEY: TCB SecretKey
 *
 * 2. 运行脚本:
 *    npx ts-node scripts/migrate-media.ts
 *
 * 注意：
 * - 脚本会下载 Vercel Blob 中的图片并上传到 TCB
 * - 同时更新数据库中的图片 URL
 */

import { PrismaClient } from '@prisma/client';
import tcb from '@cloudbase/node-sdk';

const prisma = new PrismaClient();

// 初始化 TCB
const tcbApp = tcb.init({
  env: process.env.TCB_ENV_ID!,
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
});

// 检查 URL 是否为 Vercel Blob URL
function isVercelBlobUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes('vercel-blob') || url.includes('blob.vercel-storage.com');
}

// 从 URL 提取文件名
function extractFileName(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// 下载文件
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载失败: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// 上传到 TCB 云存储
async function uploadToTcb(
  cloudPath: string,
  fileContent: Buffer
): Promise<string> {
  const result = await tcbApp.uploadFile({
    cloudPath,
    fileContent,
  });

  if (result.fileID) {
    // 获取临时访问链接
    const urlResult = await tcbApp.getTempFileURL({
      fileList: [result.fileID],
    });
    if (urlResult.fileList && urlResult.fileList[0]?.tempFileURL) {
      return urlResult.fileList[0].tempFileURL;
    }
    return result.fileID;
  }

  throw new Error('上传失败');
}

async function migrateMedia() {
  console.log('开始媒体文件迁移...\n');

  try {
    // 1. 迁移文章封面图片
    console.log('📷 迁移文章封面图片...');
    const posts = await prisma.post.findMany({
      where: {
        coverImage: { not: null },
      },
      select: {
        id: true,
        slug: true,
        coverImage: true,
      },
    });

    let migratedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      if (!isVercelBlobUrl(post.coverImage)) {
        skippedCount++;
        continue;
      }

      try {
        console.log(`  处理文章: ${post.slug}`);
        const fileName = extractFileName(post.coverImage!);
        const fileContent = await downloadFile(post.coverImage!);
        const newUrl = await uploadToTcb(`covers/${fileName}`, fileContent);

        await prisma.post.update({
          where: { id: post.id },
          data: { coverImage: newUrl },
        });

        console.log(`    ✅ 已迁移: ${fileName}`);
        migratedCount++;
      } catch (error) {
        console.error(`    ❌ 迁移失败: ${post.slug}`, error);
      }
    }

    console.log(`\n  文章封面迁移完成: ${migratedCount} 成功, ${skippedCount} 跳过`);

    // 2. 迁移课程封面图片
    console.log('\n📷 迁移课程封面图片...');
    const courses = await prisma.course.findMany({
      where: {
        coverImage: { not: null },
      },
      select: {
        id: true,
        slug: true,
        coverImage: true,
      },
    });

    migratedCount = 0;
    skippedCount = 0;

    for (const course of courses) {
      if (!isVercelBlobUrl(course.coverImage)) {
        skippedCount++;
        continue;
      }

      try {
        console.log(`  处理课程: ${course.slug}`);
        const fileName = extractFileName(course.coverImage!);
        const fileContent = await downloadFile(course.coverImage!);
        const newUrl = await uploadToTcb(`covers/${fileName}`, fileContent);

        await prisma.course.update({
          where: { id: course.id },
          data: { coverImage: newUrl },
        });

        console.log(`    ✅ 已迁移: ${fileName}`);
        migratedCount++;
      } catch (error) {
        console.error(`    ❌ 迁移失败: ${course.slug}`, error);
      }
    }

    console.log(`\n  课程封面迁移完成: ${migratedCount} 成功, ${skippedCount} 跳过`);

    console.log('\n🎉 媒体文件迁移完成！');
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 检查环境变量
if (!process.env.TCB_ENV_ID) {
  console.error('请设置 TCB_ENV_ID 环境变量');
  process.exit(1);
}

migrateMedia().catch((error) => {
  console.error(error);
  process.exit(1);
});
