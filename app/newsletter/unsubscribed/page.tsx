import Link from 'next/link';
import { MailX } from 'lucide-react';

export const metadata = {
  title: '已取消订阅',
  description: '您已成功取消订阅函数志 Newsletter',
};

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <MailX className="mx-auto mb-6 h-20 w-20 text-gray-400" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          已取消订阅
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          您已成功取消订阅函数志 Newsletter。如果您改变主意，可以随时重新订阅。
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
