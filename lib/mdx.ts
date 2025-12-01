import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { PostType } from '@/types/post';
import { prisma } from '@/lib/prisma';

const contentDirectory = path.join(process.cwd(), 'content');

// 从数据库获取所有已发布的文章
async function getAllPostsFromDB(): Promise<PostType[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        tags: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return posts.map((post) => {
      const content = post.content || '';
      const stats = readingTime(content);
      const readingTimeText = `${Math.ceil(stats.minutes)} min`;

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        updated: post.updatedAt.toISOString(),
        tags: post.tags.map((tag) => tag.name),
        readingTime: readingTimeText,
        content,
        coverImage: post.coverImage || undefined,
        draft: false,
      } as PostType;
    });
  } catch (error) {
    console.error('Error fetching posts from database:', error);
    return [];
  }
}

// 从数据库根据 slug 获取文章
async function getPostBySlugFromDB(slug: string): Promise<PostType | null> {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug,
      },
      include: {
        tags: true,
      },
    });

    if (!post || !post.published) {
      return null;
    }

    const content = post.content || '';
    const stats = readingTime(content);
    const readingTimeText = `${Math.ceil(stats.minutes)} min`;

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      updated: post.updatedAt.toISOString(),
      tags: post.tags.map((tag) => tag.name),
      readingTime: readingTimeText,
      content,
      coverImage: post.coverImage || undefined,
      draft: false,
    } as PostType;
  } catch (error) {
    console.error('Error fetching post from database:', error);
    return null;
  }
}

// 获取所有博客文章（优先从数据库，然后从文件系统）
export async function getAllPosts(): Promise<PostType[]> {
  // 优先从数据库获取
  const dbPosts = await getAllPostsFromDB();

  // 如果数据库有文章，直接返回
  if (dbPosts.length > 0) {
    return dbPosts;
  }

  // 否则从文件系统读取（向后兼容）
  const blogDirectory = path.join(contentDirectory, 'blog');

  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const allPostsData = fileNames
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((fileName) => {
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // 计算阅读时间
      const stats = readingTime(content);
      const readingTimeText = `${Math.ceil(stats.minutes)} min`;

      // 从文件名生成 slug（如果没有在 frontmatter 中指定）
      const slug = data.slug || fileName.replace(/\.(mdx|md)$/, '');

      return {
        slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        updated: data.updated,
        tags: data.tags || [],
        coverImage: data.coverImage,
        readingTime: data.readingTime || readingTimeText,
        series: data.series,
        draft: data.draft ?? false,
        content,
      } as PostType;
    })
    .filter((post) => !post.draft) // 过滤草稿
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });

  return allPostsData;
}

// 同步版本（用于向后兼容，但优先使用异步版本）
export function getAllPostsSync(): PostType[] {
  const blogDirectory = path.join(contentDirectory, 'blog');

  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const allPostsData = fileNames
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((fileName) => {
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const stats = readingTime(content);
      const readingTimeText = `${Math.ceil(stats.minutes)} min`;
      const slug = data.slug || fileName.replace(/\.(mdx|md)$/, '');

      return {
        slug,
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        updated: data.updated,
        tags: data.tags || [],
        coverImage: data.coverImage,
        readingTime: data.readingTime || readingTimeText,
        series: data.series,
        draft: data.draft ?? false,
        content,
      } as PostType;
    })
    .filter((post) => !post.draft)
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });

  return allPostsData;
}

// 根据 slug 获取单篇文章（优先从数据库，然后从文件系统）
export async function getPostBySlug(slug: string): Promise<PostType | null> {
  // 优先从数据库获取
  const dbPost = await getPostBySlugFromDB(slug);
  if (dbPost) {
    return dbPost;
  }

  // 否则从文件系统读取（向后兼容）
  const blogDirectory = path.join(contentDirectory, 'blog');

  if (!fs.existsSync(blogDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(blogDirectory);

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.mdx') && !fileName.endsWith('.md')) {
      continue;
    }

    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const postSlug = data.slug || fileName.replace(/\.(mdx|md)$/, '');

    if (postSlug === slug) {
      const stats = readingTime(content);
      const readingTimeText = `${Math.ceil(stats.minutes)} min`;

      return {
        slug: postSlug,
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        updated: data.updated,
        tags: data.tags || [],
        coverImage: data.coverImage,
        readingTime: data.readingTime || readingTimeText,
        series: data.series,
        draft: data.draft ?? false,
        content,
      } as PostType;
    }
  }

  return null;
}

// 根据标签获取文章
export async function getPostsByTag(tag: string): Promise<PostType[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags?.includes(tag));
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagsSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

// 获取分页文章
export async function getPaginatedPosts(
  page: number = 1,
  pageSize: number = 10
): Promise<{
  posts: PostType[];
  total: number;
  totalPages: number;
}> {
  const allPosts = await getAllPosts();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    total,
    totalPages,
  };
}

// 获取相关文章（基于标签相似度）
export async function getRelatedPosts(
  currentSlug: string,
  tags: string[] = [],
  limit: number = 4
): Promise<PostType[]> {
  const allPosts = await getAllPosts();

  // 排除当前文章
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  if (tags.length === 0) {
    // 没有标签时返回最新文章
    return otherPosts.slice(0, limit);
  }

  // 计算每篇文章与当前文章的标签相似度
  const postsWithScore = otherPosts.map((post) => {
    const postTags = post.tags || [];
    const commonTags = tags.filter((tag) => postTags.includes(tag));
    return {
      post,
      score: commonTags.length,
    };
  });

  // 按相似度排序，相同相似度按日期排序
  postsWithScore.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
  });

  return postsWithScore.slice(0, limit).map((item) => item.post);
}

// 获取文章归档（按年月分组）
export async function getPostsArchive(): Promise<
  Map<string, Map<string, PostType[]>>
> {
  const allPosts = await getAllPosts();
  const archive = new Map<string, Map<string, PostType[]>>();

  allPosts.forEach((post) => {
    const date = new Date(post.date);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    if (!archive.has(year)) {
      archive.set(year, new Map());
    }

    const yearMap = archive.get(year)!;
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }

    yearMap.get(month)!.push(post);
  });

  return archive;
}

// 将归档转换为可序列化的格式
export async function getPostsArchiveFormatted(): Promise<
  Array<{
    year: string;
    months: Array<{
      month: string;
      posts: PostType[];
    }>;
    totalPosts: number;
  }>
> {
  const archive = await getPostsArchive();
  const result: Array<{
    year: string;
    months: Array<{
      month: string;
      posts: PostType[];
    }>;
    totalPosts: number;
  }> = [];

  // 按年份降序排列
  const sortedYears = Array.from(archive.keys()).sort((a, b) =>
    b.localeCompare(a)
  );

  for (const year of sortedYears) {
    const yearMap = archive.get(year)!;
    const months: Array<{ month: string; posts: PostType[] }> = [];

    // 按月份降序排列
    const sortedMonths = Array.from(yearMap.keys()).sort((a, b) =>
      b.localeCompare(a)
    );

    let totalPosts = 0;
    for (const month of sortedMonths) {
      const posts = yearMap.get(month)!;
      months.push({ month, posts });
      totalPosts += posts.length;
    }

    result.push({ year, months, totalPosts });
  }

  return result;
}
