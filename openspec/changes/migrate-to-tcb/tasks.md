## 1. 环境准备

- [ ] 1.1 创建腾讯云 TCB 环境
- [ ] 1.2 开通 TCB MySQL 数据库
- [ ] 1.3 开通 TCB 云存储
- [ ] 1.4 获取 TCB 密钥和环境 ID

## 2. 代码适配 - 数据库

- [x] 2.1 修改 `prisma/schema.prisma` 将 provider 改为 mysql
- [x] 2.2 重写 `lib/prisma.ts` 移除 Neon 适配器
- [x] 2.3 更新数据模型适配 MySQL 语法差异
- [x] 2.4 运行 prisma generate 验证模型
- [ ] 2.5 测试本地 MySQL 连接

## 3. 代码适配 - 文件存储

- [x] 3.1 安装 @cloudbase/node-sdk (package.json 已更新)
- [x] 3.2 创建 `lib/tcb.ts` TCB 初始化文件
- [x] 3.3 重写 `app/api/admin/upload/route.ts` 使用 TCB 云存储
- [x] 3.4 创建云存储文件访问工具函数
- [ ] 3.5 测试文件上传功能

## 4. 代码适配 - 部署配置

- [x] 4.1 创建 `cloudbaserc.json` TCB 配置文件
- [x] 4.2 更新 `next.config.mjs` 适配 TCB 部署
- [x] 4.3 配置环境变量模板 (.env.example)
- [x] 4.4 移除 Vercel 特定配置

## 5. 数据迁移

- [ ] 5.1 备份 Neon PostgreSQL 数据
- [x] 5.2 编写数据转换脚本 (`scripts/migrate-to-tcb.ts`)
- [ ] 5.3 导入数据到 TCB MySQL
- [ ] 5.4 验证数据完整性

## 6. 媒体文件迁移

- [x] 6.1 编写媒体迁移脚本 (`scripts/migrate-media.ts`)
- [ ] 6.2 上传图片到 TCB 云存储
- [ ] 6.3 更新数据库中的图片 URL
- [ ] 6.4 验证图片访问正常

## 7. 部署和验证

- [ ] 7.1 首次部署到 TCB
- [ ] 7.2 验证所有 API 功能
- [ ] 7.3 验证 SSR 渲染正常
- [ ] 7.4 验证评论、搜索等功能
- [ ] 7.5 配置自定义域名 (funclog.com)
- [ ] 7.6 性能测试

## 8. 清理

- [x] 8.1 更新项目文档
- [x] 8.2 更新 `openspec/project.md`
- [x] 8.3 删除 Vercel 和 Neon 相关依赖 (package.json)
