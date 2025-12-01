'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LoginModal } from './LoginModal';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: '首页', href: '/' },
  { label: '博客', href: '/blog' },
  { label: '教程', href: '/courses' },
  { label: '归档', href: '/archive' },
  { label: '收藏', href: '/bookmarks' },
  { label: '项目', href: '/projects' },
  { label: '关于', href: '/about' },
  { label: '管理', href: '/admin/posts' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 检查是否已登录
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      router.push('/admin/posts');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    router.push('/admin/posts');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            函数志
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              if (link.label === '管理') {
                return (
                  <button
                    key={link.href}
                    onClick={handleAdminClick}
                    className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="搜索"
            >
              <Search className="h-5 w-5" />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              aria-label="切换菜单"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 md:hidden',
            mobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-2 pt-4">
            {navLinks.map((link) => {
              if (link.label === '管理') {
                return (
                  <button
                    key={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      handleAdminClick(e);
                    }}
                    className="rounded-lg px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
