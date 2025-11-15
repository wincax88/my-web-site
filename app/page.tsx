import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/mdx';
import { Card } from '@/components/Card';
import { ArrowRight, BookOpen, Code, Lightbulb } from 'lucide-react';

export default async function Home() {
  const allPosts = await getAllPosts();
  const featuredPosts = allPosts.slice(0, 3);
  const latestPosts = allPosts.slice(0, 6);
  const tags = (await getAllTags()).slice(0, 20);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            欢迎来到函数志
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            分享编程教程、技术博客和开发经验
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              浏览博客
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              查看教程
              <BookOpen className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
            <Code className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">技术博客</h3>
            <p className="text-gray-600 dark:text-gray-400">
              分享最新的技术趋势和开发经验
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-semibold mb-2">编程教程</h3>
            <p className="text-gray-600 dark:text-gray-400">
              系统化的学习路径和实践指南
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-xl font-semibold mb-2">最佳实践</h3>
            <p className="text-gray-600 dark:text-gray-400">
              总结开发中的经验和教训
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">精选文章</h2>
            <Link
              href="/blog"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              查看全部
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">最新文章</h2>
            <Link
              href="/blog"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              查看全部
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">标签云</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

