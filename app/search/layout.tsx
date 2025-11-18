import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索技术博客文章，快速找到您需要的内容',
  openGraph: {
    title: '搜索 - 函数志',
    description: '搜索技术博客文章，快速找到您需要的内容',
    type: 'website',
    url: `${siteUrl}/search`,
  },
  alternates: {
    canonical: `${siteUrl}/search`,
  },
  robots: {
    index: false, // 搜索页面通常不需要被索引
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
