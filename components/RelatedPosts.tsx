import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { PostType } from '@/types/post';
import { FileText } from 'lucide-react';

interface RelatedPostsProps {
  posts: PostType[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 text-xl font-bold">相关文章</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-800/50"
          >
            {/* 封面图片 */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-400 to-purple-500">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileText className="h-8 w-8 text-white/80" />
                </div>
              )}
            </div>

            {/* 文章信息 */}
            <div className="flex-1 overflow-hidden">
              <h3 className="mb-1 line-clamp-2 text-sm font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {post.title}
              </h3>
              <time
                dateTime={post.date}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {formatDate(post.date)}
              </time>
              {post.tags && post.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
