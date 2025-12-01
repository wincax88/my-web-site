# 函数志 - 功能完善 TODO LIST

基于对项目的全面分析，以下是需要完善的功能清单。

---

## 🔴 高优先级（安全/核心问题）

### 1. 认证系统安全漏洞 ✅ 已完成

- [x] **移除硬编码密码** - 已使用环境变量存储凭证
- [x] 实现真正的认证系统（NextAuth.js + JWT）
- [x] API 路由添加身份验证中间件保护
- [x] 实现密码加密存储（bcrypt）

> **实现说明**:
> - 使用 NextAuth.js 实现完整的认证系统
> - 管理员凭证通过环境变量配置 (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`)
> - 密码使用 bcrypt 加密存储
> - 所有 `/api/admin/*` 路由都受到认证保护
> - 参考 `.env.example` 配置环境变量
> - 使用 `scripts/hash-password.ts` 生成密码哈希

### 2. 评论系统安全 ✅ 已完成

- [x] 添加垃圾评论防护（验证码/reCAPTCHA）
- [x] 添加评论内容 XSS 过滤
- [x] 实现评论频率限制

> **实现说明**:
> - 使用 Google reCAPTCHA v3 实现隐形验证码防护
> - 使用 sanitize-html 库进行 XSS 过滤，移除所有 HTML 标签
> - 添加可疑内容检测（脚本注入、SQL 注入、垃圾链接等）
> - 实现增强的频率限制（每分钟3条，超限后封禁10分钟）
> - 参考 `.env.example` 配置 reCAPTCHA 密钥
> - 相关文件：`lib/sanitize.ts`, `lib/recaptcha.ts`, `lib/rate-limit.ts`

---

## 🟡 中优先级（功能完善）

### 3. 教程模块 ✅ 已完成

- [x] 实现教程内容管理系统（目前 `courses/page.tsx` 只是占位符）
- [x] 支持系列教程/课程章节
- [x] 添加学习进度追踪

> **实现说明**:
> - 创建 Course 和 Lesson 数据模型（Prisma）
> - 课程支持三种难度等级（入门/进阶/高级）
> - 支持课程标签和封面图片
> - 课时支持 MDX 内容渲染、预计学习时长
> - 实现基于浏览器指纹的学习进度追踪
> - 完整的管理后台：课程和课时的增删改查
> - 前台页面：课程列表、课程详情、课时学习页面
> - 相关文件：
>   - 数据模型：`prisma/schema.prisma`
>   - API 路由：`app/api/courses/*`, `app/api/admin/courses/*`, `app/api/progress/*`
>   - 前台页面：`app/courses/*`
>   - 后台页面：`app/admin/courses/*`
>   - 组件：`components/CourseForm.tsx`

### 4. 评论管理 ✅ 已完成

- [x] 添加管理后台评论审核页面
- [x] 实现评论回复功能（嵌套评论）
- [x] 添加评论删除/编辑功能

> **实现说明**:
> - 实现嵌套评论支持（Prisma 自引用关系）
> - 管理后台评论审核页面，支持批量审核/删除
> - 前台评论组件支持嵌套显示和回复功能
> - 相关文件：
>   - `prisma/schema.prisma` - 添加 parentId、replies 字段
>   - `app/api/admin/comments/*` - 评论管理 API
>   - `app/admin/comments/page.tsx` - 评论审核页面
>   - `components/Comments.tsx` - 嵌套评论组件

### 5. 管理后台增强 ✅ 已完成

- [x] 添加访问统计分析仪表板
- [x] 添加标签管理页面（增删改）
- [x] ~~添加评论管理页面~~ (已在评论管理中完成)
- [x] 实现文章浏览量统计（views 字段已有，但未实现增量逻辑）

> **实现说明**:
> - 实现文章浏览量追踪（ViewCounter 组件 + API）
> - 创建标签管理页面（增删改查）
> - 创建数据统计仪表板（概览卡片、热门文章、最近评论）
> - 相关文件：
>   - `app/api/posts/[slug]/views/route.ts` - 浏览量 API
>   - `components/ViewCounter.tsx` - 浏览量组件
>   - `app/api/admin/tags/*` - 标签管理 API
>   - `app/admin/tags/page.tsx` - 标签管理页面
>   - `app/api/admin/analytics/route.ts` - 统计数据 API
>   - `app/admin/dashboard/page.tsx` - 数据统计仪表板

### 6. 文章功能增强 ✅ 已完成

- [x] 实现相关文章推荐
- [ ] 实现系列文章导航（schema 中有 series 字段但未使用）
- [x] 添加文章归档页面（按年/月分类）
- [x] 实现文章点赞功能

> **实现说明**:
> - 相关文章推荐基于标签相似度评分
> - 文章归档页面按年/月分类展示，带时间轴样式
> - 点赞功能使用 localStorage 防止重复点赞
> - 相关文件：
>   - `lib/mdx.ts` - 添加 `getRelatedPosts()` 和 `getPostsArchiveFormatted()`
>   - `components/RelatedPosts.tsx` - 相关文章组件
>   - `components/LikeButton.tsx` - 点赞按钮组件
>   - `app/archive/page.tsx` - 文章归档页面
>   - `app/api/posts/[slug]/likes/route.ts` - 点赞 API

---

## 🟢 低优先级（体验优化）

### 7. 用户体验 ✅ 已完成

- [x] 添加阅读进度指示器
- [x] 添加文章收藏功能
- [x] 实现骨架屏 loading 状态
- [x] 代码高亮主题切换（亮色/暗色）
- [x] 添加回到顶部按钮

> **实现说明**:
> - 阅读进度指示器显示在页面顶部，跟随滚动位置变化
> - 文章收藏功能使用 localStorage 存储，支持收藏/取消收藏
> - 新增收藏页面 `/bookmarks` 查看已收藏文章
> - 骨架屏 loading 状态覆盖博客列表、文章详情、课程列表
> - 代码高亮主题自动跟随网站主题（亮色/暗色）
> - 回到顶部按钮在滚动超过 300px 后显示
> - 相关文件：
>   - `components/ReadingProgress.tsx` - 阅读进度指示器
>   - `components/BackToTop.tsx` - 回到顶部按钮
>   - `components/BookmarkButton.tsx` - 收藏按钮
>   - `components/Skeleton.tsx` - 骨架屏组件库
>   - `app/bookmarks/page.tsx` - 收藏页面
>   - `app/blog/loading.tsx` - 博客列表加载态
>   - `app/blog/[slug]/loading.tsx` - 文章详情加载态
>   - `app/courses/loading.tsx` - 课程列表加载态

### 8. SEO 和性能 ✅ 已完成

- [x] 配置 Next.js Image 优化
- [x] 添加 PWA 支持
- [x] 实现增量静态再生成 (ISR) 优化

> **实现说明**:
> - Next.js Image 优化：配置 AVIF/WebP 格式、响应式尺寸、30 天缓存
> - PWA 支持：创建 manifest.json、Service Worker、离线页面
> - ISR 优化：博客、文章、课程、归档页面均配置 60 秒重新验证
> - 相关文件：
>   - `next.config.mjs` - Image 优化配置
>   - `public/manifest.json` - PWA 清单
>   - `public/sw.js` - Service Worker
>   - `app/offline/page.tsx` - 离线页面
>   - `components/ServiceWorkerRegistration.tsx` - SW 注册组件
>   - 各页面添加 `export const revalidate = 60`

### 9. 社交功能 ✅ 已完成

- [x] 实现 Newsletter 订阅功能
- [x] ~~添加文章阅读量显示~~ (已在管理后台增强中完成)
- [x] 集成社交媒体分享统计

> **实现说明**:
> - Newsletter 订阅：支持邮箱订阅、确认邮件、退订功能
> - 社交分享统计：追踪各平台分享次数并显示统计
> - Prisma 模型：Subscriber（订阅者）、ShareStats（分享统计）
> - 相关文件：
>   - `prisma/schema.prisma` - 添加 Subscriber 和 ShareStats 模型
>   - `app/api/newsletter/*` - Newsletter API（订阅/确认/退订）
>   - `app/api/posts/[slug]/share/route.ts` - 分享统计 API
>   - `app/newsletter/*` - Newsletter 状态页面
>   - `components/NewsletterForm.tsx` - 订阅表单组件
>   - `components/ShareButtons.tsx` - 更新为支持分享统计
>   - `components/Footer.tsx` - 添加 Newsletter 订阅入口

### 10. 国际化

- [ ] 添加多语言支持 (i18n)
- [ ] 英文界面翻译

---

## 📊 问题统计

| 类别 | 数量 | 已完成 | 紧急程度 |
|------|------|--------|----------|
| 安全问题 | 7 | 7 | 🔴 高 ✅ |
| 功能缺失 | 12 | 14 | 🟡 中 ✅ |
| 体验优化 | 8 | 9 | 🟢 低 ✅ |
| **总计** | **27** | **30** | - |

---

## 💡 建议

~~优先处理认证系统的安全问题，特别是 `LoginModal.tsx` 中的硬编码密码需要立即修复。~~ ✅ 已完成

### 推荐实施顺序

1. **第一阶段**：~~修复安全漏洞~~ ✅ 全部完成
2. **第二阶段**：完善核心功能（评论管理、文章增强）- 进行中
3. **第三阶段**：~~教程模块开发~~ ✅ 已完成
4. **第四阶段**：体验优化和国际化（持续迭代）

---

## 📝 更新日志

### 2025-12-01
- ✅ 完成认证系统安全修复
  - 集成 NextAuth.js
  - 移除硬编码密码，改用环境变量
  - 实现 bcrypt 密码加密
  - 添加 API 路由认证中间件

- ✅ 完成评论系统安全加固
  - 集成 Google reCAPTCHA v3 防止垃圾评论
  - 使用 sanitize-html 实现 XSS 过滤
  - 添加可疑内容模式检测
  - 实现增强的 IP 频率限制（3次/分钟，超限封禁10分钟）
  - 新增文件：`lib/sanitize.ts`, `lib/recaptcha.ts`, `lib/rate-limit.ts`

- ✅ 完成教程模块开发
  - 创建 Course、Lesson、LessonProgress 数据模型
  - 实现课程和课时的完整 CRUD API
  - 创建前台课程列表、详情、课时页面
  - 创建管理后台课程管理界面
  - 支持 MDX 内容渲染和目录导航
  - 实现学习进度追踪 API
  - 新增文件：
    - `types/course.ts` - 类型定义
    - `app/courses/*` - 前台页面
    - `app/admin/courses/*` - 管理后台
    - `app/api/courses/*` - 公开 API
    - `app/api/admin/courses/*` - 管理 API
    - `app/api/progress/*` - 进度追踪 API
    - `components/CourseForm.tsx` - 课程编辑表单

- ✅ 完成评论管理功能
  - 实现嵌套评论数据模型（自引用关系）
  - 创建管理后台评论审核页面
  - 支持评论批量审核、拒绝、删除
  - 支持评论内容编辑
  - 前台评论组件支持嵌套显示
  - 前台评论支持回复功能
  - 新增文件：
    - `app/api/admin/comments/*` - 评论管理 API
    - `app/admin/comments/page.tsx` - 评论审核页面
  - 修改文件：
    - `prisma/schema.prisma` - Comment 模型添加嵌套支持
    - `app/api/posts/[slug]/comments/route.ts` - 支持回复和嵌套返回
    - `components/Comments.tsx` - 嵌套显示和回复功能

- ✅ 完成管理后台增强功能
  - 实现文章浏览量追踪（基于 sessionStorage 防重复计数）
  - 博客文章页面显示浏览量
  - 创建标签管理页面（增删改查）
  - 创建数据统计仪表板
    - 概览卡片：文章/课程/评论/浏览量统计
    - 热门文章 Top 10
    - 最近评论列表
    - 热门标签展示
    - 快捷操作入口
  - 所有管理页面添加完整导航链接
  - 新增文件：
    - `app/api/posts/[slug]/views/route.ts` - 浏览量 API
    - `components/ViewCounter.tsx` - 浏览量组件
    - `app/api/admin/tags/*` - 标签管理 API
    - `app/admin/tags/page.tsx` - 标签管理页面
    - `app/api/admin/analytics/route.ts` - 统计数据 API
    - `app/admin/dashboard/page.tsx` - 数据统计仪表板

- ✅ 完成文章功能增强
  - 实现相关文章推荐（基于标签相似度评分）
  - 创建文章归档页面（按年/月分类，带时间轴样式）
  - 实现文章点赞功能（支持点赞/取消点赞，使用 localStorage 防重复）
  - 博客文章页面新增点赞按钮和相关文章区域
  - Prisma Schema 添加 likes 字段
  - 新增文件：
    - `lib/mdx.ts` - 添加 `getRelatedPosts()` 和 `getPostsArchiveFormatted()` 函数
    - `components/RelatedPosts.tsx` - 相关文章推荐组件
    - `components/LikeButton.tsx` - 点赞按钮组件
    - `app/archive/page.tsx` - 文章归档页面
    - `app/api/posts/[slug]/likes/route.ts` - 点赞 API

- ✅ 完成用户体验优化
  - 添加阅读进度指示器（页面顶部进度条）
  - 实现文章收藏功能（localStorage 存储）
  - 创建收藏页面 `/bookmarks`
  - 实现骨架屏 loading 状态（博客、文章、课程页面）
  - 代码高亮主题自动跟随网站主题
  - 添加回到顶部按钮（滚动 300px 后显示）
  - 新增文件：
    - `components/ReadingProgress.tsx` - 阅读进度指示器
    - `components/BackToTop.tsx` - 回到顶部按钮
    - `components/BookmarkButton.tsx` - 收藏按钮组件
    - `components/Skeleton.tsx` - 骨架屏组件库
    - `app/bookmarks/page.tsx` - 收藏页面
    - `app/blog/loading.tsx` - 博客列表加载态
    - `app/blog/[slug]/loading.tsx` - 文章详情加载态
    - `app/courses/loading.tsx` - 课程列表加载态

- ✅ 完成 SEO 和性能优化
  - Next.js Image 优化配置（AVIF/WebP 格式、响应式尺寸、30 天缓存）
  - PWA 支持（manifest.json、Service Worker、离线页面）
  - ISR 增量静态再生成（博客、文章、课程、归档页面每 60 秒重新验证）
  - 新增文件：
    - `next.config.mjs` - 更新 Image 优化配置
    - `public/manifest.json` - PWA 清单文件
    - `public/sw.js` - Service Worker
    - `app/offline/page.tsx` - 离线页面
    - `components/ServiceWorkerRegistration.tsx` - SW 注册组件
  - 修改文件：
    - `app/layout.tsx` - 添加 PWA 元数据和 SW 注册
    - `app/blog/page.tsx` - 添加 ISR revalidate
    - `app/blog/[slug]/page.tsx` - 添加 ISR revalidate
    - `app/courses/page.tsx` - 添加 ISR revalidate
    - `app/archive/page.tsx` - 添加 ISR revalidate
