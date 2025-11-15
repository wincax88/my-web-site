import Link from 'next/link';
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
  return {
    title: `标签: ${decodedTag}`,
    description: `包含标签 "${decodedTag}" 的所有文章`,
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
      <h1 className="text-4xl font-bold mb-2">
        标签: <span className="text-blue-600 dark:text-blue-400">{decodedTag}</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        找到 {posts.length} 篇文章
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow"
          >
            {post.coverImage && (
              <div className="mb-4 aspect-video bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
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

