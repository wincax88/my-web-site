import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { Card } from '@/components/Card';
import { ArrowRight, BookOpen, Code, Lightbulb } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页',
  description:
    '欢迎来到函数志，这里分享编程教程、技术博客和开发经验。探索最新的技术趋势，学习系统化的编程教程，了解开发中的最佳实践。',
  openGraph: {
    title: '函数志 - 编程教程与技术博客',
    description: '欢迎来到函数志，这里分享编程教程、技术博客和开发经验。',
    type: 'website',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev',
  },
};

export default async function Home() {
  const allPosts = await getAllPosts();
  const featuredPosts = allPosts.slice(0, 3);
  const latestPosts = allPosts.slice(0, 6);
  const tags = (await getAllTags()).slice(0, 20);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  // 首页结构化数据 - CollectionPage
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '函数志',
    url: siteUrl,
    description: '编程教程与技术博客，分享最新的技术趋势和开发经验',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allPosts.length,
      itemListElement: featuredPosts.slice(0, 5).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          '@id': `${siteUrl}/blog/${post.slug}`,
          name: post.title,
          description: post.description,
          url: `${siteUrl}/blog/${post.slug}`,
        },
      })),
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            欢迎来到函数志
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
            分享编程教程、技术博客和开发经验
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              浏览博客
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              查看教程
              <BookOpen className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-900">
            <Code className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-400" />
            <h3 className="mb-2 text-xl font-semibold">技术博客</h3>
            <p className="text-gray-600 dark:text-gray-400">
              分享最新的技术趋势和开发经验
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-900">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-purple-600 dark:text-purple-400" />
            <h3 className="mb-2 text-xl font-semibold">编程教程</h3>
            <p className="text-gray-600 dark:text-gray-400">
              系统化的学习路径和实践指南
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-900">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            <h3 className="mb-2 text-xl font-semibold">最佳实践</h3>
            <p className="text-gray-600 dark:text-gray-400">
              总结开发中的经验和教训
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">精选文章</h2>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
            >
              查看全部
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">最新文章</h2>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
            >
              查看全部
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold">标签云</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-full bg-gray-100 px-4 py-2 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-gray-800 dark:hover:bg-blue-900 dark:hover:text-blue-400"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
