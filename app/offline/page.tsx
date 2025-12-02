import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import { ReloadButton } from './ReloadButton';

export const metadata = {
  title: '离线 - 函数志',
  description: '您当前处于离线状态',
};

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <WifiOff className="mb-6 h-24 w-24 text-gray-300 dark:text-gray-700" />
      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
        您当前处于离线状态
      </h1>
      <p className="mb-8 max-w-md text-center text-gray-600 dark:text-gray-400">
        请检查您的网络连接后重试。部分已访问的页面可能仍可从缓存中查看。
      </p>
      <div className="flex gap-4">
        <ReloadButton />
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
