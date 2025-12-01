# 函数志

基于 Next.js App Router 构建的个人网站，包含编程教程和技术博客功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容**: MDX
- **数据库**: Prisma + Neon (无服务器 PostgreSQL)
- **搜索**: Lunr.js (客户端搜索)

## 功能特性

- ✅ 博客列表与详情页（MDX 支持）
- ✅ 教程/课程管理
- ✅ 标签系统
- ✅ 全文搜索
- ✅ RSS 订阅
- ✅ Sitemap 生成
- ✅ 主题切换（深色/浅色）
- ✅ 代码高亮
- ✅ 响应式设计
- ✅ SEO 优化
- ✅ AI 文章生成和润色（需要配置 OpenAI API Key）

## 快速开始

### 安装依赖

```bash
yarn install
```

### 配置环境变量

创建 `.env.local` 文件：

**使用 Neon（推荐）：**

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key"
```

**环境变量说明：**

- `DATABASE_URL` - Neon 数据库连接字符串（带连接池）
- `DIRECT_URL` - Neon 直接连接字符串（用于 Prisma Migrate）
- `NEXT_PUBLIC_SITE_URL` - 网站URL
- `OPENAI_API_KEY` - OpenAI API密钥（用于AI生成和润色功能，可选）

> 💡 **推荐使用 Neon**：本项目已配置为使用 Neon（无服务器 PostgreSQL），完美适配 Vercel。详见 [迁移指南](./MIGRATION_GUIDE.md)。

### 初始化数据库

```bash
# 生成 Prisma Client
yarn db:generate

# 创建数据库表（开发环境）
yarn db:push

# 或使用迁移（推荐）
yarn db:migrate
```

### 开发模式

```bash
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
yarn build
yarn start
```

## 项目结构

```
my-web-site/
├── app/              # Next.js App Router 页面
├── components/       # React 组件
├── content/          # MDX 内容文件
│   ├── blog/        # 博客文章
│   └── courses/     # 教程内容
├── lib/             # 工具函数
├── prisma/          # Prisma schema
├── public/          # 静态资源
└── types/           # TypeScript 类型定义
```

## 内容管理

在 `content/blog/` 目录下创建 `.mdx` 文件，使用以下 frontmatter 格式：

```yaml
---
title: '文章标题'
description: '文章描述'
date: '2025-01-01'
tags: ['tag1', 'tag2']
slug: 'article-slug'
coverImage: '/assets/covers/image.png'
readingTime: '5 min'
draft: false
---
文章内容...
```

## 开发命令

- `yarn dev` - 启动开发服务器
- `yarn build` - 构建生产版本
- `yarn start` - 启动生产服务器
- `yarn lint` - 运行 ESLint
- `yarn typecheck` - TypeScript 类型检查
- `yarn format` - 格式化代码

### 数据库命令

- `yarn db:generate` - 生成 Prisma Client
- `yarn db:push` - 推送 schema 到数据库（开发环境）
- `yarn db:migrate` - 创建并应用迁移（开发环境）
- `yarn db:migrate:deploy` - 应用迁移（生产环境）
- `yarn db:studio` - 打开 Prisma Studio（数据库管理界面）

## 部署

推荐使用 Vercel 部署：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. **创建 Neon 数据库**：
   - 访问 [Neon 官网](https://neon.tech) 注册账户
   - 创建新项目并获取连接字符串
   - 在 Vercel 项目设置中添加环境变量：
     - `DATABASE_URL` - Neon 连接字符串
     - `DIRECT_URL` - Neon 直接连接字符串
4. 运行数据库迁移（见下方）
5. 自动部署

> 📖 **详细配置指南**：查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 了解完整的 Neon 配置步骤和数据库迁移说明。

## 许可证

MIT
