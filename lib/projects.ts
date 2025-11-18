export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

// 静态项目数据作为后备
export const projects: Project[] = [
  {
    title: 'QuizFlow',
    description:
      '一个功能强大的在线测验系统，支持创建、管理和参与各种类型的测验。',
    tags: ['TypeScript', 'Next.js', 'React'],
    link: 'https://github.com/Michael8968/QuizFlow',
  },
  {
    title: 'react-scratch-demo',
    description: '基于 React 的 Scratch 编辑器演示项目，提供可视化的编程体验。',
    tags: ['JavaScript', 'React'],
    link: 'https://github.com/Michael8968/react-scratch-demo',
  },
  {
    title: 'my-web-site',
    description: '个人网站项目，使用 Next.js 构建，包含博客、项目展示等功能。',
    tags: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    link: 'https://github.com/Michael8968/my-web-site',
  },
];

// GitHub GraphQL API 返回的仓库信息接口
interface GitHubGraphQLRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
}

interface GitHubGraphQLResponse {
  data: {
    user: {
      pinnedItems: {
        nodes: GitHubGraphQLRepo[];
      };
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
}

// 语言到标签的映射（用于补充标签信息）
const languageToTag: Record<string, string> = {
  TypeScript: 'TypeScript',
  JavaScript: 'JavaScript',
  'Jupyter Notebook': 'Python',
  Python: 'Python',
  Java: 'Java',
  'C++': 'C++',
  C: 'C',
  Go: 'Go',
  Rust: 'Rust',
  Swift: 'Swift',
  Kotlin: 'Kotlin',
  PHP: 'PHP',
  Ruby: 'Ruby',
  HTML: 'HTML',
  CSS: 'CSS',
  Vue: 'Vue',
  Svelte: 'Svelte',
  Dart: 'Dart',
  Shell: 'Shell',
};

/**
 * 从 GitHub GraphQL API 获取置顶项目数据
 * @param username GitHub 用户名
 * @param token GitHub token（必需，GraphQL API 需要认证）
 * @returns 项目列表
 */
export async function getProjectsFromGitHub(
  username: string = 'Michael8968',
  token?: string
): Promise<Project[]> {
  try {
    // GraphQL API 需要 token
    if (!token) {
      throw new Error('GitHub GraphQL API 需要提供 GITHUB_TOKEN');
    }

    // GraphQL 查询：获取用户的置顶仓库
    const query = `
      query {
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
                description
                url
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
                repositoryTopics(first: 10) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 }, // 缓存 1 小时
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API 请求失败: ${response.status}`);
    }

    const result: GitHubGraphQLResponse = await response.json();

    // 检查 GraphQL 错误
    if (result.errors) {
      throw new Error(
        `GitHub GraphQL API 错误: ${result.errors.map((e) => e.message).join(', ')}`
      );
    }

    // 检查用户是否存在
    if (!result.data?.user) {
      throw new Error(`用户 ${username} 不存在或无法访问`);
    }

    const repos = result.data.user.pinnedItems.nodes;

    // 转换为 Project 格式
    const projects: Project[] = repos.map((repo) => {
      // 从 repositoryTopics 中提取标签
      const topics =
        repo.repositoryTopics?.nodes?.map((node) => node.topic.name) || [];

      // 构建标签列表：使用 topics，如果语言存在且不在 topics 中，则添加
      const tags = [...topics];
      if (repo.primaryLanguage?.name) {
        const languageName = repo.primaryLanguage.name;
        const languageTag = languageToTag[languageName] || languageName;
        if (!tags.includes(languageTag)) {
          tags.push(languageTag);
        }
      }

      return {
        title: repo.name,
        description: repo.description || '暂无描述',
        tags: tags.length > 0 ? tags : [],
        link: repo.url,
      };
    });

    return projects;
  } catch (error) {
    console.error('从 GitHub GraphQL API 获取项目失败:', error);
    throw error;
  }
}

/**
 * 获取项目数据（优先从 GitHub GraphQL API，失败则使用静态数据）
 * @param useGitHub 是否使用 GitHub API
 * @returns 项目列表
 * @note GraphQL API 需要 GITHUB_TOKEN，如果没有 token 会自动回退到静态数据
 */
export async function getProjects(
  useGitHub: boolean = true
): Promise<Project[]> {
  if (!useGitHub) {
    return projects;
  }

  try {
    const githubUsername = process.env.GITHUB_USERNAME || 'Michael8968';
    const githubToken = process.env.GITHUB_TOKEN; // GraphQL API 需要 token

    // 如果没有 token，直接返回静态数据
    if (!githubToken) {
      console.warn(
        '未提供 GITHUB_TOKEN，使用静态项目数据。如需从 GitHub 获取置顶仓库，请配置 GITHUB_TOKEN 环境变量。'
      );
      return projects;
    }

    const githubProjects = await getProjectsFromGitHub(
      githubUsername,
      githubToken
    );

    // 如果从 GitHub 获取到了数据，返回它
    if (githubProjects.length > 0) {
      console.log('githubProjects', githubProjects);
      return githubProjects;
    }

    // 如果 GitHub 返回空数组，使用静态数据
    return projects;
  } catch (error) {
    console.error('获取项目数据失败，使用静态数据:', error);
    // 如果出错，返回静态数据作为后备
    return projects;
  }
}

/**
 * 同步获取项目数据（用于向后兼容）
 * @returns 项目列表
 */
export function getProjectsSync(): Project[] {
  return projects;
}
