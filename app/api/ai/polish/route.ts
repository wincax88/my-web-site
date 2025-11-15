import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 强制动态渲染
export const dynamic = 'force-dynamic';
// 设置最大执行时间为 60 秒（用于润色长文章）
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  timeout: 50000, // 50 秒超时
});

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: '未配置 OpenAI API Key' },
        { status: 500 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // 构建提示词
    let prompt = '';
    if (type === 'grammar') {
      // 语法润色
      prompt = `请对以下技术博客文章进行语法和表达润色，保持 Markdown 格式不变：

${content}

要求：
1. 修正语法错误和错别字
2. 优化表达，使语言更流畅自然
3. 保持 Markdown 格式（代码块、标题等）不变
4. 保持技术术语的准确性
5. 保持文章的整体风格和结构
6. 使用中文

请直接输出润色后的完整内容：`;
    } else if (type === 'style') {
      // 风格优化
      prompt = `请对以下技术博客文章进行风格优化，使其更专业、易读，保持 Markdown 格式不变：

${content}

要求：
1. 优化文章结构和段落组织
2. 改进表达方式，使其更专业、清晰
3. 增强可读性，适当添加过渡语句
4. 保持 Markdown 格式（代码块、标题等）不变
5. 保持技术内容的准确性
6. 使用中文

请直接输出优化后的完整内容：`;
    } else {
      // 全面润色
      prompt = `请对以下技术博客文章进行全面润色，包括语法、表达、风格等，保持 Markdown 格式不变：

${content}

要求：
1. 修正语法错误和错别字
2. 优化表达，使语言更流畅自然
3. 改进文章结构和段落组织
4. 增强可读性和专业性
5. 保持 Markdown 格式（代码块、标题等）不变
6. 保持技术内容的准确性
7. 使用中文

请直接输出润色后的完整内容：`;
    }

    const completion = await openai.chat.completions.create({
      //   model: 'gpt-4o-mini',
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一位专业的技术博客编辑，擅长润色技术文章，使其更专业、易读。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const polishedContent = completion.choices[0]?.message?.content || '';

    if (!polishedContent) {
      return NextResponse.json({ error: '润色失败，请重试' }, { status: 500 });
    }

    return NextResponse.json({ content: polishedContent });
  } catch (error) {
    console.error('Error polishing content:', error);
    const errorMessage = error instanceof Error ? error.message : '润色失败';
    return NextResponse.json(
      {
        error: '润色失败',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
