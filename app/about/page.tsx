import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于',
  description: '关于函数志',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">关于</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          欢迎来到函数志！这里是我分享编程教程、技术博客和开发经验的地方。
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">关于我</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          我是一名热爱编程的开发者，专注于 Web 开发和现代前端技术。
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">技术栈</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Next.js & React</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Node.js</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4">联系方式</h2>
        <p className="text-gray-700 dark:text-gray-300">
          如果您有任何问题或建议，欢迎通过以下方式联系我：
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-4">
          <li>Email: <a href="mailto:wincax@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">wincax@gmail.com</a></li>
          <li>GitHub: <a href="https://github.com/Michael8968/my-web-site" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/Michael8968/my-web-site</a></li>
          <li>Twitter: <a href="https://twitter.com/Wincax1" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@Wincax1</a></li>
        </ul>
      </div>
    </div>
  );
}

