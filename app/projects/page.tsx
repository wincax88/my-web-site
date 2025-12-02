import type { Metadata } from 'next';
import { getProjects, type Project } from '@/lib/projects';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourname.dev';

export const metadata: Metadata = {
  title: '项目',
  description:
    '浏览我的项目作品集，包括使用 Next.js、React、TypeScript 等现代技术栈开发的项目。',
  openGraph: {
    title: '项目 - 函数志',
    description:
      '浏览我的项目作品集，包括使用 Next.js、React、TypeScript 等现代技术栈开发的项目。',
    type: 'website',
    url: `${siteUrl}/projects`,
  },
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
};

// ISR: 每小时重新验证
export const revalidate = 3600;

export default async function ProjectsPage() {
  // 直接获取项目数据（避免构建时 API 不可用的问题）
  const projects = await getProjects();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">项目</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-800"
          >
            <h2 className="mb-2 text-xl font-semibold">{project.title}</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              查看项目 →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
