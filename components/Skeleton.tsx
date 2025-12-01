import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <Skeleton className="mb-4 h-48 w-full rounded-lg" />
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-4 h-10 w-3/4" />
        <div className="mb-4 flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mb-8 h-64 w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="mt-8 h-32 w-full rounded-lg" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <Skeleton className="mb-4 h-40 w-full rounded-lg" />
      <Skeleton className="mb-2 h-6 w-2/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function CourseListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="mb-1 h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function CommentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}
