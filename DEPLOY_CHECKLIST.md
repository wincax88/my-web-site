# TCB 部署检查清单

在部署到 TCB 之前，请确保完成以下步骤：

## 前置准备

- [ ] 已安装 TCB CLI：`npm install -g @cloudbase/cli`
- [ ] 已登录 TCB：`tcb login`
- [ ] 已在 TCB 控制台创建环境
- [ ] 已记录环境 ID（格式：`env-xxxxx`）

## 服务开通

- [ ] 已开通 TCB 云数据库 MySQL
- [ ] 已获取 MySQL 连接字符串
- [ ] 已开通 TCB 云存储
- [ ] 已创建存储桶（如需要）

## 环境变量配置

在 TCB 控制台 > 环境设置 > 环境变量中配置：

### 必需变量

- [ ] `DATABASE_URL` - MySQL 连接字符串
- [ ] `TCB_ENV_ID` - TCB 环境 ID
- [ ] `NEXTAUTH_SECRET` - 随机密钥（使用 `openssl rand -base64 32` 生成）
- [ ] `NEXTAUTH_URL` - 网站 URL（如：`https://your-domain.com`）
- [ ] `NEXT_PUBLIC_SITE_URL` - 网站 URL
- [ ] `ADMIN_EMAIL` - 管理员邮箱
- [ ] `ADMIN_PASSWORD_HASH_B64` - 管理员密码哈希（使用 `npx ts-node scripts/hash-password.ts your-password` 生成）

### 可选变量

- [ ] `OPENAI_API_KEY` - OpenAI API 密钥（用于 AI 功能）
- [ ] `RECAPTCHA_SECRET_KEY` - reCAPTCHA 密钥（用于评论验证）

> **注意**：在 TCB 云函数环境中，不需要配置 `TCB_SECRET_ID` 和 `TCB_SECRET_KEY`。

## 数据库初始化

- [ ] 已运行 `yarn db:generate` 生成 Prisma Client
- [ ] 已运行 `yarn db:push` 或 `yarn db:migrate` 创建数据库表
- [ ] 已验证数据库连接正常

## 数据迁移（如需要）

如果从其他数据库迁移：

- [ ] 已备份源数据库数据
- [ ] 已运行数据迁移脚本：`npx ts-node scripts/migrate-to-tcb.ts`
- [ ] 已验证数据完整性

## 媒体文件迁移（如需要）

如果从其他存储迁移：

- [ ] 已运行媒体迁移脚本：`npx ts-node scripts/migrate-media.ts`
- [ ] 已验证图片访问正常

## 部署

- [ ] 已设置 `TCB_ENV_ID` 环境变量（本地）
- [ ] 已运行 `yarn deploy:tcb` 或 `tcb framework deploy`
- [ ] 部署成功，无错误

## 验证

部署后验证：

- [ ] 首页正常加载
- [ ] 博客列表和详情页正常显示
- [ ] API 路由正常工作（如 `/api/posts`）
- [ ] 文件上传功能正常
- [ ] 评论功能正常
- [ ] 搜索功能正常
- [ ] 管理员登录功能正常

## 域名配置（如需要）

- [ ] 已在 TCB 控制台配置自定义域名
- [ ] 已配置 DNS 解析
- [ ] SSL 证书已自动配置完成
- [ ] 域名访问正常

## 监控和日志

- [ ] 已查看 TCB 控制台的函数执行日志
- [ ] 已查看监控指标（请求量、错误率等）
- [ ] 已查看数据库性能指标

## 完成

所有步骤完成后，您的网站应该已经成功部署到 TCB！

如有问题，请参考 [TCB 部署指南](./TCB_DEPLOYMENT.md) 或查看 TCB 官方文档。

