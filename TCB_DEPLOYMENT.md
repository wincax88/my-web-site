# 腾讯云 TCB 部署指南

本指南将帮助您将项目部署到腾讯云 CloudBase (TCB) 平台。

## 前置准备

### 1. 安装 TCB CLI

```bash
npm install -g @cloudbase/cli
```

### 2. 登录 TCB

```bash
tcb login
```

按照提示完成登录。

### 3. 创建 TCB 环境

1. 访问 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 创建新环境（如果还没有）
3. 记录环境 ID（格式：`env-xxxxx`）

### 4. 开通云数据库 MySQL

1. 在 TCB 控制台中，进入「云数据库」页面
2. 开通 MySQL 数据库
3. 创建数据库实例
4. 获取数据库连接字符串（格式：`mysql://user:password@host:port/database`）

### 5. 开通云存储

1. 在 TCB 控制台中，进入「云存储」页面
2. 开通云存储服务
3. 创建存储桶（如果需要）

### 6. 获取 TCB 密钥（可选）

如果需要在本地环境测试 TCB 功能，需要获取密钥：

1. 访问 [腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 创建或查看 SecretId 和 SecretKey

> **注意**：在云函数环境中，TCB 会自动提供认证，不需要手动配置 SecretId 和 SecretKey。

## 环境变量配置

### 本地开发环境

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="mysql://user:password@host:port/database"

# TCB 配置
TCB_ENV_ID="env-xxxxx"
TCB_SECRET_ID="your-secret-id"  # 本地开发需要
TCB_SECRET_KEY="your-secret-key"  # 本地开发需要

# NextAuth 配置
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 管理员账户
ADMIN_EMAIL="your-admin@email.com"
ADMIN_PASSWORD_HASH="your-bcrypt-hash"  # 使用 scripts/hash-password.ts 生成

# OpenAI (可选)
OPENAI_API_KEY="your-openai-api-key"

# reCAPTCHA (可选)
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

### TCB 生产环境

在 TCB 控制台中配置环境变量：

1. 进入 TCB 控制台
2. 选择您的环境
3. 进入「环境设置」>「环境变量」
4. 添加以下环境变量：

**必需变量：**
- `DATABASE_URL` - MySQL 数据库连接字符串
- `TCB_ENV_ID` - TCB 环境 ID
- `NEXTAUTH_SECRET` - NextAuth 密钥（随机字符串）
- `NEXTAUTH_URL` - 网站 URL（如：`https://your-domain.com`）
- `NEXT_PUBLIC_SITE_URL` - 网站 URL
- `ADMIN_EMAIL` - 管理员邮箱
- `ADMIN_PASSWORD_HASH` - 管理员密码哈希（使用 `scripts/hash-password.ts` 生成）

**可选变量：**
- `OPENAI_API_KEY` - OpenAI API 密钥（用于 AI 功能）
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA 密钥（用于评论验证）

> **注意**：在 TCB 云函数环境中，不需要配置 `TCB_SECRET_ID` 和 `TCB_SECRET_KEY`，TCB 会自动提供认证。

## 数据库初始化

### 1. 生成 Prisma Client

```bash
yarn db:generate
```

### 2. 推送数据库 Schema

```bash
yarn db:push
```

或者使用迁移：

```bash
yarn db:migrate
```

### 3. 数据迁移（如果从其他数据库迁移）

如果要从 PostgreSQL (Neon) 迁移数据到 TCB MySQL：

```bash
# 设置源数据库和目标数据库环境变量
export SOURCE_DATABASE_URL="postgresql://..."
export DATABASE_URL="mysql://..."

# 运行迁移脚本
npx ts-node scripts/migrate-to-tcb.ts
```

## 媒体文件迁移

如果要从 Vercel Blob 迁移图片到 TCB 云存储：

```bash
# 设置环境变量
export TCB_ENV_ID="env-xxxxx"
export TCB_SECRET_ID="your-secret-id"
export TCB_SECRET_KEY="your-secret-key"
export DATABASE_URL="mysql://..."

# 运行迁移脚本
npx ts-node scripts/migrate-media.ts
```

## 部署到 TCB

### 方法 1: 使用 TCB CLI 部署

```bash
# 设置环境变量（或使用 .env 文件）
export TCB_ENV_ID="env-xxxxx"

# 部署
tcb framework deploy
```

### 方法 2: 使用 npm 脚本部署

```bash
# 设置环境变量
export TCB_ENV_ID="env-xxxxx"

# 部署
yarn deploy:tcb
```

### 部署配置

项目使用 `cloudbaserc.json` 配置文件，主要配置项：

- **环境 ID**: 通过环境变量 `TCB_ENV_ID` 设置
- **区域**: `ap-shanghai`（上海）
- **运行时**: Node.js 18.15
- **内存**: 512MB
- **超时**: 60秒
- **构建命令**: `node scripts/build-with-fix.js`

## 验证部署

部署完成后，访问 TCB 提供的默认域名或您配置的自定义域名，验证：

1. ✅ 首页正常加载
2. ✅ 博客列表和详情页正常显示
3. ✅ API 路由正常工作
4. ✅ 文件上传功能正常
5. ✅ 评论功能正常
6. ✅ 搜索功能正常

## 自定义域名配置

1. 在 TCB 控制台中，进入「环境设置」>「域名管理」
2. 添加自定义域名（如：`funclog.com`）
3. 按照提示配置 DNS 解析
4. 等待 SSL 证书自动配置完成

## 常见问题

### 1. 构建失败

- 检查 `next.config.mjs` 中的配置是否正确
- 确保 `scripts/build-with-fix.js` 可执行
- 查看 TCB 控制台的构建日志

### 2. 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 确认 MySQL 数据库已开通并运行
- 检查数据库白名单设置（允许 TCB 云函数访问）

### 3. 文件上传失败

- 确认云存储已开通
- 检查 `TCB_ENV_ID` 是否正确
- 在云函数环境中，TCB 会自动认证，不需要 SecretId/SecretKey

### 4. 环境变量未生效

- 在 TCB 控制台检查环境变量是否正确配置
- 确保环境变量名称拼写正确
- 重新部署应用使环境变量生效

## 更新部署

当代码更新后，重新运行部署命令：

```bash
tcb framework deploy
```

或：

```bash
yarn deploy:tcb
```

## 监控和日志

- **日志查看**：在 TCB 控制台 > 「云函数」> 「日志」中查看函数执行日志
- **监控指标**：在 TCB 控制台 > 「监控」中查看请求量、错误率等指标
- **数据库监控**：在 TCB 控制台 > 「云数据库」中查看数据库性能指标

## 相关文档

- [TCB 官方文档](https://cloud.tencent.com/document/product/876)
- [TCB Framework 文档](https://cloud.tencent.com/document/product/876/41440)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)

