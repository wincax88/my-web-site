import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import type { PostType } from '@/types/post';

interface CardProps {
  post: PostType;
}

export function Card({ post }: CardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-gray-800"
    >
      {post.coverImage ? (
        <div className="relative mb-4 aspect-video overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="mb-4 aspect-video overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
          <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 transition-transform duration-300 group-hover:scale-105" />
        </div>
      )}
      <h2 className="mb-2 line-clamp-2 text-xl font-semibold transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
  );
}
