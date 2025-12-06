## ADDED Requirements

### Requirement: TCB 云托管部署

系统 SHALL 部署在腾讯云 CloudBase (TCB) 平台上，支持 Next.js SSR。

#### Scenario: SSR 页面渲染

- **WHEN** 用户访问博客文章页面
- **THEN** TCB 云函数执行 Next.js SSR 渲染
- **AND** 返回完整的 HTML 页面

#### Scenario: API 路由请求

- **WHEN** 客户端调用 API 路由 (如 /api/posts)
- **THEN** TCB 云函数处理请求
- **AND** 返回 JSON 响应

### Requirement: TCB 部署配置

系统 SHALL 使用 cloudbaserc.json 配置 TCB 部署参数。

#### Scenario: 部署配置生效

- **WHEN** 执行 tcb framework deploy
- **THEN** 读取 cloudbaserc.json 配置
- **AND** 部署 Next.js 应用到指定环境
- **AND** 配置环境变量

### Requirement: 环境变量管理

系统 SHALL 支持通过 TCB 控制台或配置文件管理环境变量。

#### Scenario: 环境变量配置

- **GIVEN** 需要配置 DATABASE_URL、TCB 密钥等环境变量
- **WHEN** 在 TCB 控制台或 cloudbaserc.json 中配置
- **THEN** 应用运行时可访问这些环境变量
