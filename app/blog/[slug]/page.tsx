import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { extractHeadings } from '@/lib/toc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { TableOfContents } from '@/components/TableOfContents';
import { ShareButtons } from '@/components/ShareButtons';
import { CodeBlock } from '@/components/CodeBlock';
import { Comments } from '@/components/Comments';
import type { Metadata } from 'next';
import type { PostType } from '@/types/post';

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
  return posts.map((post) => ({
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

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      images: post.coverImage ? [post.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

// MDX 组件映射
const createMdxComponents = () => ({
  h1: ({ id, ...props }: any) => (
    <h1 id={id} className="text-4xl font-bold mt-8 mb-4 scroll-mt-20" {...props} />
  ),
  h2: ({ id, ...props }: any) => (
    <h2 id={id} className="text-3xl font-semibold mt-6 mb-3 scroll-mt-20" {...props} />
  ),
  h3: ({ id, ...props }: any) => (
    <h3 id={id} className="text-2xl font-semibold mt-4 mb-2 scroll-mt-20" {...props} />
  ),
  h4: ({ id, ...props }: any) => (
    <h4 id={id} className="text-xl font-semibold mt-4 mb-2 scroll-mt-20" {...props} />
  ),
  p: (props: any) => <p className="mb-4 leading-7" {...props} />,
  a: (props: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
  ol: (props: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
  ),
  li: (props: any) => <li className="mb-1" {...props} />,
  code: (props: any) => {
    // 行内代码
    if (!props.className) {
      return (
        <code
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm"
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
      return <CodeBlock {...codeElement} />;
    }
    return <pre {...props} />;
  },
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4 text-gray-700 dark:text-gray-300"
      {...props}
    />
  ),
});

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8 max-w-7xl mx-auto">
        <article className="flex-1 max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
          </header>

          {post.coverImage && (
            <div className="mb-8 aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* 封面图占位，实际使用时用 next/image */}
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content && post.content.trim() ? (
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    development: false,
                    remarkPlugins: [remarkGfm],
                    // @ts-expect-error - rehype plugin types are incompatible
                    rehypePlugins,
                  },
                }}
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
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}

