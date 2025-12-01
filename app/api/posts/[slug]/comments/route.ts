import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAndSanitizeComment } from '@/lib/sanitize';
import { verifyRecaptchaToken, isRecaptchaConfigured } from '@/lib/recaptcha';
import { checkCommentRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// 强制动态渲染，避免构建时静态分析
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 1. 频率限制检查
    const rateLimitResult = checkCommentRateLimit(ip);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      const errorMessage = rateLimitResult.blocked
        ? `请求过于频繁，请在 ${Math.ceil((rateLimitResult.blockExpiresIn || 0) / 1000)} 秒后重试`
        : '请求过于频繁，请稍后再试';

      return NextResponse.json(
        { error: errorMessage },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    const body = await request.json();
    const { author, content, recaptchaToken, parentId } = body;

    // 2. reCAPTCHA 验证（如果已配置）
    if (isRecaptchaConfigured()) {
      const recaptchaResult = await verifyRecaptchaToken(
        recaptchaToken,
        'submit_comment'
      );

      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: recaptchaResult.error || '验证码验证失败' },
          { status: 403 }
        );
      }

      // 根据分数决定是否自动批准评论
      // 高分（>= 0.7）的评论更可能是真人
      console.log(`[Comment] reCAPTCHA score: ${recaptchaResult.score}`);
    }

    // 3. XSS 防护和输入验证
    let sanitizedAuthor: string;
    let sanitizedContent: string;

    try {
      const sanitized = validateAndSanitizeComment(author, content);
      sanitizedAuthor = sanitized.author;
      sanitizedContent = sanitized.content;
    } catch (validationError) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : '输入验证失败';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 4. 查找或创建文章（基于 slug）
    let post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      // 如果文章不存在，创建一个占位记录
      post = await prisma.post.create({
        data: {
          slug,
          title: slug,
          description: '',
          published: false,
        },
      });
    }

    // 5. 验证父评论（如果是回复）
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: '回复的评论不存在' },
          { status: 404, headers: rateLimitHeaders }
        );
      }

      // 确保父评论属于同一篇文章
      if (parentComment.postId !== post.id) {
        return NextResponse.json(
          { error: '评论不属于该文章' },
          { status: 400, headers: rateLimitHeaders }
        );
      }
    }

    // 6. 创建评论
    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        author: sanitizedAuthor,
        content: sanitizedContent,
        approved: false, // 默认需要审核
        parentId: parentId || null,
      },
    });

    console.log(
      `[Comment] New ${parentId ? 'reply' : 'comment'} created: ${comment.id} for post ${slug}`
    );

    return NextResponse.json(
      {
        id: comment.id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
        message: '评论已提交，等待审核',
      },
      { status: 201, headers: rateLimitHeaders }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}

// 递归构建嵌套评论结构
interface CommentWithReplies {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  replies: CommentWithReplies[];
}

function buildNestedComments(
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    parentId: string | null;
  }>
): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  // 首先创建所有评论的映射
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  // 然后构建树结构
  comments.forEach((comment) => {
    const node = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            author: true,
            content: true,
            createdAt: true,
            parentId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ comments: [] });
    }

    // 构建嵌套结构
    const nestedComments = buildNestedComments(post.comments);

    // 转换为 JSON 友好格式
    const formatComment = (comment: CommentWithReplies): object => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      replies: comment.replies.map(formatComment),
    });

    return NextResponse.json({
      comments: nestedComments.map(formatComment),
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}
