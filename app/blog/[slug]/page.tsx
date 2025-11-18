import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { extractHeadings } from '@/lib/toc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { TableOfContents } from '@/components/TableOfContents';
import { ShareButtons } from '@/components/ShareButtons';
import { CodeBlock } from '@/components/CodeBlock';
import { Mermaid } from '@/components/Mermaid';
import { Comments } from '@/components/Comments';
import type { Metadata } from 'next';

// 准备 rehype 插件配置
const rehypePlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'wrap',
      properties: {
        className: ['anchor'],
      },
    },
  ],
];

// 生成静态路径
export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/mdx');
  const posts = await getAllPosts();

  // 验证每个文章的内容，只返回可以编译的文章
  const validPosts = [];
  for (const post of posts) {
    if (post.content && post.content.trim()) {
      // 检查是否有明显的 MDX 语法错误
      // 1. 以数字开头的 JSX 属性名: <div 1prop="value">
      // 2. 以数字开头的组件名: <1Component />
      const hasInvalidAttribute = /<\w+[^>]*\s\d+\w*\s*=/g.test(post.content);
      const hasInvalidComponent = /<\d+\w+/g.test(post.content);

      if (hasInvalidAttribute || hasInvalidComponent) {
        console.warn(
          `跳过可能有 MDX 语法错误的文章: ${post.slug} (检测到以数字开头的 JSX 属性或组件名)`
        );
        continue;
      }
    }
    validPosts.push(post);
  }

  return validPosts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成元数据
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { getPostBySlug } = await import('@/lib/mdx');
  const post = await getPostBySlug(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const coverImage = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${siteUrl}${post.coverImage}`
    : `${siteUrl}/og-image.png`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: 'Michael Wong' }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: postUrl,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: ['Michael Wong'],
      tags: post.tags,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      creator: '@Wincax1',
      images: [coverImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

// MDX 组件映射
const createMdxComponents = () => ({
  h1: ({ id, ...props }: any) => (
    <h1
      id={id}
      className="mb-4 mt-8 scroll-mt-[84px] text-3xl font-bold"
      {...props}
    />
  ),
  h2: ({ id, ...props }: any) => (
    <h2
      id={id}
      className="mb-3 mt-6 scroll-mt-[84px] text-2xl font-semibold"
      {...props}
    />
  ),
  h3: ({ id, ...props }: any) => (
    <h3
      id={id}
      className="mb-2 mt-4 scroll-mt-[84px] text-xl font-semibold"
      {...props}
    />
  ),
  h4: ({ id, ...props }: any) => (
    <h4
      id={id}
      className="mb-2 mt-4 scroll-mt-[84px] text-lg font-semibold"
      {...props}
    />
  ),
  p: (props: any) => <p className="mb-4 text-sm leading-6" {...props} />,
  a: (props: any) => (
    <a
      className="text-blue-600 hover:underline dark:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul className="mb-4 list-inside list-disc space-y-1" {...props} />
  ),
  ol: (props: any) => (
    <ol className="mb-4 list-inside list-decimal space-y-1" {...props} />
  ),
  li: (props: any) => <li className="mb-1" {...props} />,
  code: (props: any) => {
    // 行内代码
    if (!props.className) {
      return (
        <code
          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800"
          {...props}
        />
      );
    }
    // 代码块（有 className 表示是代码块）
    return <code {...props} />;
  },
  pre: (props: any) => {
    // 检查是否是代码块
    const codeElement = props.children?.props;
    if (codeElement?.className) {
      const language = codeElement.className.replace('language-', '');
      // 如果是 mermaid 代码块，使用 Mermaid 组件
      if (language === 'mermaid') {
        const chart = String(codeElement.children || '').trim();
        return <Mermaid chart={chart} />;
      }
      // 其他代码块使用 CodeBlock
      return <CodeBlock {...codeElement} />;
    }
    return <pre {...props} />;
  },
  blockquote: (props: any) => (
    <blockquote
      className="my-4 border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:border-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
});

// MDX 内容组件，带错误处理
async function MdxContentWithErrorHandling({
  content,
  components,
}: {
  content: string;
  components: ReturnType<typeof createMdxComponents>;
}) {
  try {
    return (
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            development: false,
            remarkPlugins: [remarkGfm],
            // @ts-expect-error - rehype plugin types are incompatible
            rehypePlugins,
          },
        }}
      />
    );
  } catch (error) {
    console.error('MDX 编译错误:', error);
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">
          MDX 编译错误
        </h3>
        <p className="mb-2 text-sm text-red-700 dark:text-red-300">
          文章内容包含无法编译的 MDX 语法。请检查文章内容，确保：
        </p>
        <ul className="mb-2 list-inside list-disc text-sm text-red-700 dark:text-red-300">
          <li>JSX 属性名不能以数字开头</li>
          <li>组件名不能以数字开头</li>
          <li>确保所有 JSX 标签正确闭合</li>
        </ul>
        {process.env.NODE_ENV === 'development' && error instanceof Error && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400">
              错误详情
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900 dark:bg-red-900/40 dark:text-red-200">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { getPostBySlug } = await import('@/lib/mdx');
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const headings = post.content ? extractHeadings(post.content) : [];
  const mdxComponents = createMdxComponents();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const coverImage = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${siteUrl}${post.coverImage}`
    : `${siteUrl}/og-image.png`;

  // 文章结构化数据
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: coverImage,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: {
      '@type': 'Person',
      name: 'Michael Wong',
      url: 'https://github.com/Michael8968',
    },
    publisher: {
      '@type': 'Person',
      name: 'Michael Wong',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags?.join(', ') || '',
    articleSection: post.tags?.[0] || '技术',
    wordCount: post.content?.split(/\s+/).length || 0,
  };

  // 面包屑导航结构化数据
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '博客',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div className="mx-auto flex max-w-7xl gap-8">
        <article className="max-w-4xl flex-1">
          <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
            <div className="mb-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.updated && (
                <>
                  <span>•</span>
                  <time dateTime={post.updated}>
                    更新于 {formatDate(post.updated)}
                  </time>
                </>
              )}
              <span>•</span>
              <span>{post.readingTime}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/tag/${tag}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
          </header>

          {post.coverImage ? (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          ) : null}

          <div className="prose dark:prose-invert max-w-none">
            {post.content && post.content.trim() ? (
              <MdxContentWithErrorHandling
                content={post.content}
                components={mdxComponents}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无内容</p>
            )}
          </div>

          <ShareButtons
            title={post.title}
            url={postUrl}
            description={post.description}
          />

          <Comments slug={post.slug} />
        </article>

        {headings.length > 0 && (
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
