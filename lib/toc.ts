import { Heading } from '@/types/post';

// 生成与 rehype-slug 兼容的 ID
// rehype-slug 使用类似 GitHub 风格的 slug 生成
function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // 移除 HTML 标签（如果有）
      .replace(/<[^>]*>/g, '')
      // 将中文字符、字母、数字、空格、连字符保留，其他字符移除
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      // 将空格和多个连字符替换为单个连字符
      .replace(/[\s-]+/g, '-')
      // 移除开头和结尾的连字符
      .replace(/^-+|-+$/g, '')
  );
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text);

    headings.push({
      id,
      level,
      text,
    });
  }

  return headings;
}
