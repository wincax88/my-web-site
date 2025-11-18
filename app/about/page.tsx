import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

export const metadata: Metadata = {
  title: '关于',
  description:
    '了解函数志的创建者，技术栈和联系方式。我是一名热爱编程的开发者，专注于 Web 开发和现代前端技术。',
  openGraph: {
    title: '关于 - 函数志',
    description:
      '了解函数志的创建者，技术栈和联系方式。我是一名热爱编程的开发者，专注于 Web 开发和现代前端技术。',
    type: 'profile',
    url: `${siteUrl}/about`,
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">关于</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          欢迎来到函数志！这里是我分享编程教程、技术博客和开发经验的地方。
        </p>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">关于我</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          我是一名热爱编程的开发者，专注于 Web 开发和现代前端技术。
        </p>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">技术栈</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
          <li>Next.js & React</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Node.js</li>
        </ul>
        <h2 className="mb-4 mt-8 text-2xl font-semibold">联系方式</h2>
        <p className="text-gray-700 dark:text-gray-300">
          如果您有任何问题或建议，欢迎通过以下方式联系我：
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            Email:{' '}
            <a
              href="mailto:wincax@gmail.com"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              wincax@gmail.com
            </a>
          </li>
          <li>
            GitHub:{' '}
            <a
              href="https://github.com/Michael8968/my-web-site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              github.com/Michael8968/my-web-site
            </a>
          </li>
          <li>
            Twitter:{' '}
            <a
              href="https://twitter.com/Wincax1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              @Wincax1
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
