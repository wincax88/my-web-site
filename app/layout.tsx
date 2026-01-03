import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';
const siteName = '函数志';
const siteDescription = '编程教程与技术博客，分享最新的技术趋势和开发经验';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    '编程',
    '教程',
    '技术博客',
    'Next.js',
    'React',
    'TypeScript',
    'Web开发',
    '前端开发',
    '后端开发',
    '全栈开发',
  ],
  authors: [{ name: 'Michael Wong' }],
  creator: 'Michael Wong',
  publisher: 'Michael Wong',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': [{ url: `${siteUrl}/rss.xml` }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    creator: '@Wincax1',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = 'zh';
  try {
    locale = await getLocale();
  } catch {
    // Use default locale
  }

  return (
    <html lang={locale === 'zh' ? 'zh-CN' : 'en'} suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
