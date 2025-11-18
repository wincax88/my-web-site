import Link from 'next/link';
import Image from 'next/image';
import { getPaginatedPosts } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { page?: string };
}): Promise<Metadata> {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';
  const baseTitle = '博客';
  const title =
    currentPage > 1 ? `${baseTitle} - 第${currentPage}页` : baseTitle;

  return {
    title,
    description: '浏览所有技术博客文章，了解最新的编程教程和开发经验',
    openGraph: {
      title,
      description: '浏览所有技术博客文章，了解最新的编程教程和开发经验',
      type: 'website',
      url: `${siteUrl}/blog${currentPage > 1 ? `?page=${currentPage}` : ''}`,
    },
    alternates: {
      canonical: `${siteUrl}/blog${currentPage > 1 ? `?page=${currentPage}` : ''}`,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const { posts, totalPages } = await getPaginatedPosts(currentPage, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">博客</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-800"
          >
            {post.coverImage ? (
              <div className="relative mb-4 aspect-video overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ) : (
              <div className="mb-4 aspect-video overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500" />
              </div>
            )}
            <h2 className="mb-2 text-xl font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {post.title}
            </h2>
            <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {post.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>{post.readingTime}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/blog?page=${currentPage - 1}`}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              上一页
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/blog?page=${page}`}
              className={`rounded border px-4 py-2 ${
                page === currentPage
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/blog?page=${currentPage + 1}`}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              下一页
            </Link>
          )}
        </div>
      )}

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
        </div>
      )}
    </div>
  );
}
