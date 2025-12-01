/**
 * XSS sanitization utilities for user-generated content
 *
 * Uses sanitize-html to clean user input and prevent XSS attacks
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize comment content - strips all HTML tags
 * Only allows plain text to prevent XSS attacks
 */
export function sanitizeCommentContent(content: string): string {
  // Strip all HTML tags, only allow plain text
  const sanitized = sanitizeHtml(content, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: 'discard', // Remove disallowed tags completely
    textFilter: (text) => {
      // Normalize whitespace and trim
      return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    },
  });

  return sanitized.trim();
}

/**
 * Sanitize author name - strips all HTML and limits special characters
 */
export function sanitizeAuthorName(author: string): string {
  // Strip all HTML tags
  const sanitized = sanitizeHtml(author, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });

  // Remove any control characters and excessive whitespace
  return sanitized
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if content contains potentially malicious patterns
 * Returns true if content is suspicious
 */
export function containsSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    // Script injection attempts
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:text\/html/i,

    // URL spam patterns
    /\[url/i,
    /\[link/i,

    // Common spam patterns
    /viagra|cialis|casino|lottery|winner/i,
    /bit\.ly|tinyurl|goo\.gl/i, // URL shorteners often used in spam

    // SQL injection attempts (basic check)
    /('|")\s*(or|and)\s*('|"|\d)/i,
    /union\s+select/i,
    /;\s*drop\s+table/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(content));
}

/**
 * Validate and sanitize comment input
 * Returns sanitized data or throws error if invalid
 */
export function validateAndSanitizeComment(
  author: string,
  content: string
): { author: string; content: string } {
  // Basic validation
  if (!author || !content) {
    throw new Error('作者和内容不能为空');
  }

  // Sanitize inputs
  const sanitizedAuthor = sanitizeAuthorName(author);
  const sanitizedContent = sanitizeCommentContent(content);

  // Check after sanitization
  if (!sanitizedAuthor || sanitizedAuthor.length === 0) {
    throw new Error('作者名称无效');
  }

  if (!sanitizedContent || sanitizedContent.length === 0) {
    throw new Error('评论内容无效');
  }

  // Length validation
  if (sanitizedAuthor.length > 100) {
    throw new Error('作者名称过长（最多100字符）');
  }

  if (sanitizedContent.length > 5000) {
    throw new Error('评论内容过长（最多5000字符）');
  }

  // Check for suspicious content
  if (
    containsSuspiciousContent(sanitizedAuthor) ||
    containsSuspiciousContent(sanitizedContent)
  ) {
    throw new Error('检测到可疑内容，请修改后重试');
  }

  return {
    author: sanitizedAuthor,
    content: sanitizedContent,
  };
}
