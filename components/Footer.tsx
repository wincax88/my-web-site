import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">关于</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              分享编程教程和技术博客，记录学习与成长。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  博客
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  教程
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  项目
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  关于
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">关注我</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/Michael8968/my-web-site"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/Wincax1"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:wincax@gmail.com"
                className="rounded-lg bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">订阅更新</h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              获取最新文章和教程通知
            </p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <p>© {currentYear} 函数志. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}
