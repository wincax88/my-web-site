import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const { getAllTags } = await import('@/lib/mdx');
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { tag: string };
}): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';
  const tagUrl = `${siteUrl}/tag/${encodeURIComponent(decodedTag)}`;

  return {
    title: `标签: ${decodedTag}`,
    description: `浏览包含标签 "${decodedTag}" 的所有技术博客文章`,
    openGraph: {
      title: `标签: ${decodedTag} - 函数志`,
      description: `浏览包含标签 "${decodedTag}" 的所有技术博客文章`,
      type: 'website',
      url: tagUrl,
    },
    alternates: {
      canonical: tagUrl,
    },
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const decodedTag = decodeURIComponent(params.tag);
  const { getPostsByTag } = await import('@/lib/mdx');
  const posts = await getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-4xl font-bold">
        标签:{' '}
        <span className="text-blue-600 dark:text-blue-400">{decodedTag}</span>
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        找到 {posts.length} 篇文章
      </p>

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
          </Link>
        ))}
      </div>
    </div>
  );
}
