import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

export const metadata: Metadata = {
  title: '教程',
  description:
    '系统化的编程教程和课程，帮助您从零开始学习 Web 开发、前端技术和后端开发。',
  openGraph: {
    title: '教程 - 函数志',
    description:
      '系统化的编程教程和课程，帮助您从零开始学习 Web 开发、前端技术和后端开发。',
    type: 'website',
    url: `${siteUrl}/courses`,
  },
  alternates: {
    canonical: `${siteUrl}/courses`,
  },
};

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">教程</h1>
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          教程内容即将上线，敬请期待！
        </p>
      </div>
    </div>
  );
}
