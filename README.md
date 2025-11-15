# 函数志

基于 Next.js App Router 构建的个人网站，包含编程教程和技术博客功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容**: MDX
- **数据库**: Prisma (支持 SQLite/PostgreSQL)
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

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
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
title: "文章标题"
description: "文章描述"
date: "2025-01-01"
tags: ["tag1", "tag2"]
slug: "article-slug"
coverImage: "/assets/covers/image.png"
readingTime: "5 min"
draft: false
---

文章内容...
```

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run typecheck` - TypeScript 类型检查
- `npm run format` - 格式化代码

## 部署

推荐使用 Vercel 部署：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

## 许可证

MIT

