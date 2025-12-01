import { PostListSkeleton } from '@/components/Skeleton';

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <PostListSkeleton count={6} />
    </div>
  );
}
