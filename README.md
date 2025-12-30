# 函数志

基于 Next.js App Router 构建的个人网站，包含编程教程和技术博客功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容**: MDX
- **数据库**: Prisma + MySQL (腾讯云 TCB)
- **存储**: 腾讯云 TCB 云存储
- **部署**: 腾讯云 CloudBase (TCB)
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

```env
# 数据库
DATABASE_URL="mysql://user:password@host:port/database"

# TCB 配置
TCB_ENV_ID="env-xxxxx"
TCB_SECRET_ID="your-secret-id"  # 仅本地开发需要
TCB_SECRET_KEY="your-secret-key"  # 仅本地开发需要

# NextAuth 配置
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 管理员账户
ADMIN_EMAIL="your-admin@email.com"
ADMIN_PASSWORD_HASH_B64="your-base64-encoded-bcrypt-hash"  # 使用 scripts/hash-password.ts 生成

# OpenAI (可选)
OPENAI_API_KEY="your-openai-api-key"

# reCAPTCHA (可选)
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

**环境变量说明：**

- `DATABASE_URL` - TCB MySQL 数据库连接字符串
- `TCB_ENV_ID` - TCB 环境 ID
- `TCB_SECRET_ID` / `TCB_SECRET_KEY` - TCB 密钥（仅本地开发需要）
- `NEXTAUTH_SECRET` - NextAuth 密钥（使用 `openssl rand -base64 32` 生成）
- `NEXTAUTH_URL` - NextAuth 回调 URL
- `NEXT_PUBLIC_SITE_URL` - 网站 URL
- `ADMIN_EMAIL` - 管理员邮箱
- `ADMIN_PASSWORD_HASH_B64` - 管理员密码哈希（Base64 编码，使用 `npx ts-node scripts/hash-password.ts your-password` 生成）
- `OPENAI_API_KEY` - OpenAI API 密钥（可选，用于 AI 功能）
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA 密钥（可选，用于评论验证）

> 💡 **生成密码哈希**：运行 `npx ts-node scripts/hash-password.ts your-password` 生成管理员密码哈希。

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

### 部署到腾讯云 TCB

推荐使用腾讯云 CloudBase (TCB) 部署：

1. **安装 TCB CLI**

   ```bash
   npm install -g @cloudbase/cli
   ```

2. **登录 TCB**

   ```bash
   tcb login
   ```

3. **创建 TCB 环境**
   - 访问 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
   - 创建新环境并记录环境 ID

4. **开通云数据库 MySQL**
   - 在 TCB 控制台开通 MySQL 数据库
   - 获取数据库连接字符串

5. **开通云存储**
   - 在 TCB 控制台开通云存储服务

6. **配置环境变量**
   - 在 TCB 控制台 > 环境设置 > 环境变量中配置所有必需的环境变量
   - 详见 [TCB 部署指南](./TCB_DEPLOYMENT.md)

7. **初始化数据库**

   ```bash
   yarn db:generate
   yarn db:push
   ```

8. **部署应用**
   ```bash
   yarn deploy:tcb
   ```
   或
   ```bash
   tcb framework deploy
   ```

> 📖 **详细部署指南**：查看 [TCB_DEPLOYMENT.md](./TCB_DEPLOYMENT.md) 了解完整的 TCB 部署步骤和配置说明。

## 许可证

MIT
