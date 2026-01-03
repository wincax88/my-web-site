import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  // Website structured data
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

  // Person structured data
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
    <>
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
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <ServiceWorkerRegistration />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </NextIntlClientProvider>
    </>
  );
}
