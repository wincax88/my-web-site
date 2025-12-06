# Project Context

## Purpose

函数志（my-web-site）是一个中文技术博客网站，用于分享编程教程、技术博客和开发经验。网站支持博客文章管理、全文搜索、评论系统，以及 AI 辅助内容创作功能。

## Tech Stack

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: React 18, Tailwind CSS, Lucide Icons
- **数据库**: MySQL (腾讯云 TCB) + Prisma ORM
- **存储**: 腾讯云 TCB 云存储（封面图片上传）
- **部署**: 腾讯云 CloudBase (TCB)
- **内容**: MDX (next-mdx-remote), gray-matter, reading-time
- **搜索**: Lunr.js 全文搜索
- **AI**: OpenAI API (支持自定义 BaseURL，如 DeepSeek)
- **测试**: Vitest + Testing Library
- **代码风格**: ESLint, Prettier

## Project Conventions

### Code Style

- 使用 Prettier 进行代码格式化（配置 prettier-plugin-tailwindcss）
- 使用 ESLint 进行代码检查（eslint-config-next）
- TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 中文注释和用户界面

### Architecture Patterns

- **App Router**: 使用 Next.js 14 App Router 结构
- **API Routes**: `/app/api/` 下的 RESTful API
- **组件**: `/components/` 下的可复用 UI 组件
- **工具库**: `/lib/` 下的工具函数和数据访问层
- **内容源**: 优先从数据库读取，回退到文件系统（`/content/blog/`）
- **样式**: Tailwind CSS + 暗色模式支持

### Testing Strategy

- 使用 Vitest 进行单元测试和组件测试
- 测试文件放在 `__tests__` 目录下
- 使用 Testing Library 进行 React 组件测试
- 运行测试: `npm test` 或 `npm run test:ui`

### Git Workflow

- 主分支: `main`
- 提交信息使用中文或英文，描述清晰
- 使用 Prisma Migrate 管理数据库迁移

## Domain Context

- **博客文章**: 存储在数据库（Post 模型），支持草稿/发布状态
- **标签系统**: 多对多关系，支持按标签筛选
- **评论系统**: 支持游客评论，需要审核后显示
- **AI 功能**: 文章内容润色（语法/风格/全面润色）和 AI 生成
- **搜索功能**: 客户端全文搜索，支持标题、描述、内容、标签
- **SEO**: 完整的 Open Graph、Twitter Card、JSON-LD 结构化数据

## Important Constraints

- 必须支持中文内容和界面
- 使用腾讯云 TCB MySQL，需要配置 `DATABASE_URL` 环境变量
- TCB 云存储需要配置 `TCB_ENV_ID`、`TCB_SECRET_ID`、`TCB_SECRET_KEY`
- AI 功能需要配置 `OPENAI_API_KEY` 和可选的 `OPENAI_BASE_URL`
- 管理后台使用简单的 session 认证（sessionStorage）

## External Dependencies

- **腾讯云 TCB**: 云托管、MySQL 数据库、云存储
- **OpenAI API / DeepSeek**: AI 内容润色和生成
- **RSS/Sitemap**: 自动生成 `/rss.xml` 和 `/sitemap.xml`

## Key Pages

- `/` - 首页（精选文章、最新文章、标签云）
- `/blog` - 博客列表
- `/blog/[slug]` - 博客文章详情（目录、评论、分享）
- `/tag/[tag]` - 按标签筛选
- `/search` - 全文搜索
- `/courses` - 教程页面
- `/projects` - 项目展示
- `/about` - 关于页面
- `/admin/posts` - 文章管理后台

## API Endpoints

- `GET/POST /api/admin/posts` - 文章列表和创建
- `GET/PUT/DELETE /api/admin/posts/[id]` - 单篇文章操作
- `POST /api/admin/upload` - 封面图片上传
- `POST /api/ai/polish` - AI 文章润色
- `POST /api/ai/generate` - AI 内容生成
- `GET/POST /api/posts/[slug]/comments` - 文章评论
- `GET /api/search-index` - 搜索索引
- `GET /api/projects` - 项目数据
