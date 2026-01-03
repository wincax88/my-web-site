import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: '操作失败',
  description: 'Newsletter 操作失败',
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: '缺少验证信息，请检查链接是否完整。',
  invalid_token: '验证链接无效或已过期，请重新订阅。',
  server_error: '服务器出错，请稍后重试。',
};

export default async function NewsletterErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || 'server_error';
  const message = ERROR_MESSAGES[reason] || ERROR_MESSAGES.server_error;

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto mb-6 h-20 w-20 text-red-500" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
          操作失败
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">{message}</p>
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
