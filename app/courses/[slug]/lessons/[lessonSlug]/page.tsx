import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { prisma } from '@/lib/prisma';
import { extractHeadings } from '@/lib/toc';
import { TableOfContents } from '@/components/TableOfContents';
import { CodeBlock } from '@/components/CodeBlock';
import { Mermaid } from '@/components/Mermaid';
import {
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

type Props = {
  params: Promise<{ slug: string; lessonSlug: string }>;
};

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

// MDX 组件
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
    if (!props.className) {
      return (
        <code
          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props: any) => {
    const codeElement = props.children?.props;
    if (codeElement?.className) {
      const language = codeElement.className.replace('language-', '');
      if (language === 'mermaid') {
        const chart = String(codeElement.children || '').trim();
        return <Mermaid chart={chart} />;
      }
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

async function getLesson(courseSlug: string, lessonSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!course) return null;

  const lesson = await prisma.lesson.findUnique({
    where: {
      courseId_slug: {
        courseId: course.id,
        slug: lessonSlug,
      },
      published: true,
    },
  });

  if (!lesson) return null;

  // 获取所有课时用于侧边栏导航
  const allLessons = await prisma.lesson.findMany({
    where: { courseId: course.id, published: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      order: true,
      duration: true,
    },
  });

  // 获取上一课时和下一课时
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    lesson: {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      order: lesson.order,
      duration: lesson.duration,
    },
    course: {
      slug: course.slug,
      title: course.title,
    },
    allLessons,
    prevLesson,
    nextLesson,
    currentIndex,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const data = await getLesson(slug, lessonSlug);

  if (!data) {
    return {
      title: '课时不存在',
    };
  }

  return {
    title: `${data.lesson.title} - ${data.course.title}`,
    description: data.lesson.description || `${data.course.title} 课程课时`,
    openGraph: {
      title: `${data.lesson.title} - ${data.course.title}`,
      description: data.lesson.description || `${data.course.title} 课程课时`,
      type: 'article',
      url: `${siteUrl}/courses/${slug}/lessons/${lessonSlug}`,
    },
    alternates: {
      canonical: `${siteUrl}/courses/${slug}/lessons/${lessonSlug}`,
    },
  };
}

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
          内容编译错误
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          课时内容包含无法编译的语法，请联系管理员。
        </p>
      </div>
    );
  }
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonSlug } = await params;
  const data = await getLesson(slug, lessonSlug);

  if (!data) {
    notFound();
  }

  const { lesson, course, allLessons, prevLesson, nextLesson, currentIndex } =
    data;
  const headings = lesson.content ? extractHeadings(lesson.content) : [];
  const mdxComponents = createMdxComponents();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/courses" className="hover:text-blue-600">
          教程
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/courses/${course.slug}`} className="hover:text-blue-600">
          {course.title}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-white">{lesson.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* 左侧课程目录 - 桌面端 */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <h3 className="mb-4 font-semibold">课程目录</h3>
            <nav className="max-h-[calc(100vh-200px)] space-y-1 overflow-y-auto">
              {allLessons.map((l, index) => (
                <Link
                  key={l.id}
                  href={`/courses/${course.slug}/lessons/${l.slug}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    l.id === lesson.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                      l.id === lesson.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="line-clamp-2">{l.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="min-w-0 flex-1">
          {/* 课时标题 */}
          <header className="mb-8">
            <div className="mb-2 text-sm text-gray-500">
              第 {currentIndex + 1} 课时，共 {allLessons.length} 课时
            </div>
            <h1 className="mb-4 text-3xl font-bold">{lesson.title}</h1>
            {lesson.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>预计 {lesson.duration} 分钟</span>
              </div>
            )}
          </header>

          {/* 课时内容 */}
          <article className="prose dark:prose-invert max-w-none">
            {lesson.content && lesson.content.trim() ? (
              <MdxContentWithErrorHandling
                content={lesson.content}
                components={mdxComponents}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无内容</p>
            )}
          </article>

          {/* 上一课/下一课导航 */}
          <nav className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-700">
            {prevLesson ? (
              <Link
                href={`/courses/${course.slug}/lessons/${prevLesson.slug}`}
                className="group flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400"
              >
                <ChevronLeft className="h-5 w-5" />
                <div>
                  <div className="text-xs text-gray-400">上一课</div>
                  <div className="font-medium group-hover:text-blue-600">
                    {prevLesson.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${course.slug}/lessons/${nextLesson.slug}`}
                className="group flex items-center gap-2 text-right text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400"
              >
                <div>
                  <div className="text-xs text-gray-400">下一课</div>
                  <div className="font-medium group-hover:text-blue-600">
                    {nextLesson.title}
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug}`}
                className="group flex items-center gap-2 text-right text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400"
              >
                <div>
                  <div className="text-xs text-gray-400">完成课程</div>
                  <div className="font-medium group-hover:text-blue-600">
                    返回课程首页
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            )}
          </nav>
        </main>

        {/* 右侧目录 - 桌面端 */}
        {headings.length > 0 && (
          <aside className="hidden w-64 flex-shrink-0 xl:block">
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
