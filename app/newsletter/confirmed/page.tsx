import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';

export const metadata = {
  title: '订阅成功',
  description: '您已成功订阅函数志 Newsletter',
};

export default function NewsletterConfirmedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          订阅成功！
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          感谢您订阅函数志
          Newsletter！您将会收到最新的技术文章、教程更新和精选内容。
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <Mail className="h-5 w-5" />
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
