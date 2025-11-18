import { NextResponse } from 'next/server';
import { getAllPosts, getAllTags } from '@/lib/mdx';

export async function GET() {
  const posts = await getAllPosts();
  const tags = await getAllTags();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  const staticPages = [
    '',
    '/blog',
    '/courses',
    '/projects',
    '/about',
    '/search',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages
    .map(
      (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
    )
    .join('\n')}
  ${posts
    .map((post) => {
      const lastmod = new Date(post.updated || post.date).toISOString();
      const imageTag = post.coverImage
        ? `    <image:image>
      <image:loc>${post.coverImage.startsWith('http') ? post.coverImage : `${siteUrl}${post.coverImage}`}</image:loc>
      <image:title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
      <image:caption>${(post.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:caption>
    </image:image>`
        : '';
      return `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageTag ? '\n' + imageTag : ''}
  </url>`;
    })
    .join('\n')}
  ${tags
    .map(
      (tag) => `  <url>
    <loc>${siteUrl}/tag/${encodeURIComponent(tag)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
    )
    .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
