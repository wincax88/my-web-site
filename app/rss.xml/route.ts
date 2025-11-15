import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/mdx';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>函数志</title>
    <link>${siteUrl}</link>
    <description>编程教程与技术博客</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags?.map((tag) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`
      )
      .join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

