import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    default: '函数志',
    template: '%s | 函数志',
  },
  description: '编程教程与技术博客',
  keywords: ['编程', '教程', '技术博客', 'Next.js', 'React'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev',
    siteName: '函数志',
    title: '函数志',
    description: '编程教程与技术博客',
  },
  twitter: {
    card: 'summary_large_image',
    title: '函数志',
    description: '编程教程与技术博客',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.variable}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

