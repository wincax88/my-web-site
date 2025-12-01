import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import sharp from 'sharp';
import { requireAdminAuth } from '@/lib/auth-utils';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 允许的文件类型
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1920; // 最大宽度
const MAX_HEIGHT = 1920; // 最大高度
const QUALITY = 85; // JPEG/WebP 质量 (1-100)

// 配置请求体大小限制和超时
export const maxDuration = 60; // 60秒超时
export const runtime = 'nodejs'; // 确保使用 Node.js runtime

export async function POST(request: NextRequest) {
  console.log('[Upload API] 收到上传请求');

  // 验证管理员权限
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return auth.error;
  }

  try {
    console.log('[Upload API] 开始解析 FormData');
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('[Upload API] FormData 解析成功');
    } catch (error) {
      console.error('[Upload API] Error parsing form data:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('[Upload API] Error details:', errorMessage);
      return NextResponse.json(
        {
          error: '无法解析上传数据',
          details:
            process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    console.log(
      '[Upload API] 获取文件:',
      file ? { name: file.name, size: file.size, type: file.type } : 'null'
    );

    if (!file) {
      console.error('[Upload API] 没有上传文件');
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型。仅支持 JPEG、PNG、WebP 和 GIF' },
        { status: 400 }
      );
    }

    // 读取文件
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({ error: '读取文件失败' }, { status: 400 });
    }

    let buffer: Buffer = Buffer.from(bytes);
    const needsCompression = file.size > MAX_FILE_SIZE;

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalExtension = path.extname(file.name).toLowerCase();

    // 如果文件超过 5MB，进行压缩处理
    if (needsCompression) {
      try {
        // 检查 sharp 是否可用
        if (!sharp) {
          console.error('Sharp library not available');
          return NextResponse.json(
            { error: '图片处理功能不可用' },
            { status: 500 }
          );
        }

        let sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();

        // 验证元数据
        if (!metadata || !metadata.width || !metadata.height) {
          console.error('Invalid image metadata:', metadata);
          return NextResponse.json(
            { error: '无法读取图片信息' },
            { status: 400 }
          );
        }

        // 确定输出格式：GIF 转换为 WebP，其他保持原格式
        const outputFormat =
          originalExtension === '.gif' ? 'webp' : originalExtension.slice(1);

        // 计算新尺寸（保持宽高比）
        const originalWidth = metadata.width || 1920;
        const originalHeight = metadata.height || 1920;
        let width = originalWidth;
        let height = originalHeight;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            width = MAX_WIDTH;
            height = Math.round((originalHeight / originalWidth) * MAX_WIDTH);
          } else {
            height = MAX_HEIGHT;
            width = Math.round((originalWidth / originalHeight) * MAX_HEIGHT);
          }
        }

        // 压缩函数
        const compressImage = async (quality: number) => {
          if (outputFormat === 'webp') {
            return await sharpInstance
              .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality })
              .toBuffer();
          } else if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
            return await sharpInstance
              .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .jpeg({ quality, mozjpeg: true })
              .toBuffer();
          } else if (outputFormat === 'png') {
            return await sharpInstance
              .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .png({ quality, compressionLevel: 9 })
              .toBuffer();
          } else {
            // 其他格式也转换为 WebP
            return await sharpInstance
              .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality })
              .toBuffer();
          }
        };

        // 尝试压缩，如果仍然超过大小限制，逐步降低质量
        let currentQuality = QUALITY;
        buffer = await compressImage(currentQuality);

        // 如果压缩后仍然超过 5MB，逐步降低质量
        while (buffer.length > MAX_FILE_SIZE && currentQuality > 30) {
          currentQuality -= 10;
          buffer = await compressImage(currentQuality);
        }

        // 如果降低质量后仍然超过，进一步缩小尺寸
        if (buffer.length > MAX_FILE_SIZE && width && height) {
          const scaleFactor = Math.sqrt(MAX_FILE_SIZE / buffer.length) * 0.9; // 0.9 作为安全系数
          width = Math.round(width * scaleFactor);
          height = Math.round(height * scaleFactor);
          buffer = await compressImage(30); // 使用最低质量
        }
      } catch (compressionError) {
        console.error('图片压缩失败:', compressionError);
        const errorMessage =
          compressionError instanceof Error
            ? compressionError.message
            : '未知错误';
        // 如果压缩失败，返回错误而不是继续处理
        return NextResponse.json(
          {
            error: '图片压缩失败',
            details:
              process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: 500 }
        );
      }
    }

    // 确定最终文件扩展名
    const finalExtension =
      needsCompression && originalExtension === '.gif'
        ? '.webp'
        : originalExtension;
    const fileName = `${timestamp}-${randomString}${finalExtension}`;

    // 确定 MIME 类型
    let contentType: string;
    if (finalExtension === '.webp') {
      contentType = 'image/webp';
    } else if (finalExtension === '.jpg' || finalExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (finalExtension === '.png') {
      contentType = 'image/png';
    } else if (finalExtension === '.gif') {
      contentType = 'image/gif';
    } else {
      contentType = file.type || 'image/jpeg';
    }

    // 使用 Vercel Blob Storage 保存文件
    let blobUrl: string;
    try {
      const blob = await put(`covers/${fileName}`, buffer, {
        contentType,
        access: 'public',
      });
      blobUrl = blob.url;
      console.log('[Upload API] 文件已上传到 Blob Storage:', blobUrl);
    } catch (error) {
      console.error('Error uploading to Blob Storage:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return NextResponse.json(
        {
          error: '保存文件失败',
          details:
            process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }

    // 返回文件 URL
    const fileUrl = blobUrl;

    const finalSize = buffer.length;
    const originalSize = file.size;
    const compressed = needsCompression && finalSize < originalSize;

    return NextResponse.json(
      {
        success: true,
        url: fileUrl,
        fileName: fileName,
        originalSize: originalSize,
        finalSize: finalSize,
        compressed: compressed,
        compressionRatio: compressed
          ? `${((1 - finalSize / originalSize) * 100).toFixed(1)}%`
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Upload API] Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[Upload API] Error message:', errorMessage);
    if (errorStack) {
      console.error('[Upload API] Error stack:', errorStack);
    }

    // 确保返回 JSON 格式，而不是 HTML
    return NextResponse.json(
      {
        error: '上传失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
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
