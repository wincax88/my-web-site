import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata = {
  title: '已订阅',
  description: '您已经订阅了函数志 Newsletter',
};

export default function AlreadyConfirmedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-blue-500" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          您已经订阅了
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          您之前已经确认过订阅，无需重复操作。
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            浏览最新文章
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
