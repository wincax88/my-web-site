import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

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
  verification: {
    // 可以添加 Google Search Console 和 Bing 验证
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  // 网站结构化数据
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '函数志',
    url: siteUrl,
    description: '编程教程与技术博客，分享最新的技术趋势和开发经验',
    publisher: {
      '@type': 'Person',
      name: 'Michael Wong',
      url: 'https://github.com/Michael8968',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // 组织/个人结构化数据
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Michael Wong',
    url: siteUrl,
    sameAs: ['https://github.com/Michael8968', 'https://twitter.com/Wincax1'],
    jobTitle: 'Web Developer',
    description: '热爱编程的开发者，专注于 Web 开发和现代前端技术',
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={inter.variable}>
        <Providers>
          <ServiceWorkerRegistration />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
