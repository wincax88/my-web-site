## Context

函数志博客网站当前技术栈：
- 部署: Vercel
- 数据库: PostgreSQL (Neon Serverless) + Prisma ORM
- 存储: Vercel Blob Storage
- 框架: Next.js 14 App Router

需要迁移到腾讯云 CloudBase (TCB) 以获得更好的国内访问体验。

### 利益相关者
- 网站所有者（需要低成本、易维护）
- 国内用户（需要快速访问）

## Goals / Non-Goals

### Goals
- 将整个应用迁移到腾讯云 TCB
- 保持所有现有功能正常运行
- 迁移所有数据（文章、评论、标签等）
- 迁移所有媒体文件（封面图片）

### Non-Goals
- 添加新功能
- 重构现有业务逻辑
- 更改 UI/UX

## Decisions

### Decision 1: 数据库选择

**推荐: MySQL**

理由：
- Prisma 完整支持 MySQL，迁移成本最低
- 只需修改 schema.prisma 的 provider 和连接字符串
- 保持现有的数据模型和查询不变
- TCB MySQL 支持按量计费，成本可控

备选方案：
- MongoDB: 需要重写所有数据访问层，迁移成本高
- 外部 MySQL (如阿里云 RDS): 额外成本，网络延迟

### Decision 2: 存储方案

**选择: TCB 云存储**

理由：
- 与 TCB 托管服务无缝集成
- 自带 CDN 加速
- 支持临时链接和永久链接
- 使用 @cloudbase/js-sdk 或 HTTP API 上传

实现方式：
```typescript
// 使用 TCB Admin SDK
import tcb from '@cloudbase/node-sdk'

const app = tcb.init({
  env: process.env.TCB_ENV_ID,
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
})

const storage = app.storage()
await storage.uploadFile({
  cloudPath: `covers/${fileName}`,
  fileContent: buffer,
})
```

### Decision 3: 部署方案

**选择: TCB Next.js 静态托管 + 云函数 SSR**

TCB 支持两种 Next.js 部署方式：
1. 静态导出 (SSG) - 不支持 API Routes
2. 云函数 SSR - 完整支持 Next.js 功能

由于项目使用了 API Routes 和 SSR，需要使用云函数部署方式。

配置步骤：
1. 安装 @cloudbase/framework-plugin-next
2. 配置 cloudbaserc.json
3. 使用 tcb framework deploy 部署

## Risks / Trade-offs

### Risk 1: 数据迁移可能丢失数据
- **Mitigation**: 完整备份后再迁移，使用事务确保数据一致性

### Risk 2: API 兼容性
- TCB 云函数有冷启动问题
- **Mitigation**: 配置预置并发实例

### Risk 3: 图片 URL 变更
- 迁移后封面图片 URL 会改变
- **Mitigation**: 数据库中更新所有图片 URL，或配置 URL 重定向

### Trade-off: 运维复杂度
- TCB 控制台与 Vercel 操作方式不同
- 需要学习 TCB 的日志、监控等功能

## Migration Plan

### Phase 1: 环境准备
1. 创建腾讯云账号并开通 TCB
2. 创建 TCB 环境
3. 开通 MySQL 数据库
4. 开通云存储

### Phase 2: 代码适配
1. 修改 Prisma schema (PostgreSQL → MySQL)
2. 替换 Vercel Blob 为 TCB 云存储 SDK
3. 配置 TCB 部署文件

### Phase 3: 数据迁移
1. 导出 PostgreSQL 数据
2. 转换并导入 MySQL
3. 迁移媒体文件到 TCB 云存储
4. 更新数据库中的图片 URL

### Phase 4: 部署上线
1. 配置自定义域名（可选）
2. 部署到 TCB
3. 验证所有功能
4. 切换 DNS（如使用自定义域名）

### Rollback Plan
- 保留 Vercel 部署 7 天
- 保留 Neon 数据库备份
- 如有问题，切回原部署

## Confirmed Decisions

1. **域名**: funclog.com
2. **数据迁移**: 完整迁移现有数据
3. **MySQL**: 使用 TCB MySQL，具体规格根据需求选择
