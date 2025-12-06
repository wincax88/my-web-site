# Change: 迁移至腾讯云TCB托管

## Why

当前项目部署在 Vercel 平台，使用 Neon PostgreSQL 数据库和 Vercel Blob 存储。为了更好地服务国内用户并降低访问延迟，需要将整个技术栈迁移至腾讯云 CloudBase (TCB) 平台。

## What Changes

### 部署平台
- **BREAKING**: 从 Vercel 迁移到腾讯云 TCB 托管
- 配置 TCB 的 Next.js SSR 部署

### 数据库
- **BREAKING**: 从 PostgreSQL (Neon) 迁移到 TCB 云数据库
- TCB 提供 MongoDB 和 MySQL 两种选择
- 需要重写 Prisma schema 和数据访问层

### 文件存储
- **BREAKING**: 从 Vercel Blob 迁移到 TCB 云存储
- 重写文件上传 API (`/api/admin/upload`)
- 迁移现有的封面图片

### 环境变量
- 更新所有环境变量配置适配 TCB

## Impact

- Affected specs: database, storage, hosting (新建)
- Affected code:
  - `lib/prisma.ts` - 数据库连接
  - `prisma/schema.prisma` - 数据模型
  - `app/api/admin/upload/route.ts` - 文件上传
  - `next.config.ts` - 部署配置
  - 所有使用数据库的 API 路由

## Decisions (已确认)

1. **数据库选择**: MySQL（保持 Prisma ORM，迁移成本最低）
2. **数据迁移**: 迁移现有 PostgreSQL 数据到 MySQL
3. **域名配置**: funclog.com
