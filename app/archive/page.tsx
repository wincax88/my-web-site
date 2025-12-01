import Link from 'next/link';
import { getPostsArchiveFormatted } from '@/lib/mdx';
import type { Metadata } from 'next';

// ISR: 每 60 秒重新验证
export const revalidate = 60;

export const metadata: Metadata = {
  title: '文章归档',
  description: '按时间归档的所有博客文章',
  openGraph: {
    title: '文章归档',
    description: '按时间归档的所有博客文章',
    type: 'website',
  },
};

export default async function ArchivePage() {
  const archive = await getPostsArchiveFormatted();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  // 计算总文章数
  const totalPosts = archive.reduce(
    (sum, year) =>
      sum + year.months.reduce((mSum, month) => mSum + month.posts.length, 0),
    0
  );

  // 归档页面结构化数据
  const archiveSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '文章归档',
    description: '按时间归档的所有博客文章',
    url: `${siteUrl}/archive`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalPosts,
      itemListElement: archive.flatMap((year, yearIndex) =>
        year.months.flatMap((month, monthIndex) =>
          month.posts.map((post, postIndex) => ({
            '@type': 'ListItem',
            position: yearIndex * 100 + monthIndex * 10 + postIndex + 1,
            url: `${siteUrl}/blog/${post.slug}`,
            name: post.title,
          }))
        )
      ),
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(archiveSchema),
        }}
      />

      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">文章归档</h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {totalPosts} 篇文章
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        {archive.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            暂无文章
          </p>
        ) : (
          <div className="space-y-12">
            {archive.map((yearData) => (
              <section key={yearData.year} className="relative">
                {/* 年份标题 */}
                <h2 className="mb-6 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {yearData.year}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({yearData.totalPosts} 篇)
                  </span>
                </h2>

                {/* 月份和文章 */}
                <div className="space-y-8 border-l-2 border-gray-200 pl-6 dark:border-gray-700">
                  {yearData.months.map((monthData) => (
                    <div key={`${yearData.year}-${monthData.month}`}>
                      {/* 月份标题 */}
                      <h3 className="relative mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                          <span className="h-2 w-2 rounded-full bg-white" />
                        </span>
                        {monthData.month} 月
                        <span className="ml-2 text-sm font-normal text-gray-400">
                          ({monthData.posts.length} 篇)
                        </span>
                      </h3>

                      {/* 文章列表 */}
                      <ul className="space-y-3">
                        {monthData.posts.map((post) => (
                          <li
                            key={post.slug}
                            className="group flex items-baseline gap-4"
                          >
                            <time
                              dateTime={post.date}
                              className="flex-shrink-0 text-sm text-gray-400"
                            >
                              {new Date(post.date)
                                .getDate()
                                .toString()
                                .padStart(2, '0')}
                              日
                            </time>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                            >
                              {post.title}
                            </Link>
                            {post.tags && post.tags.length > 0 && (
                              <div className="hidden gap-1 sm:flex">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <Link
                                    key={tag}
                                    href={`/tag/${tag}`}
                                    className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                  >
                                    {tag}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
