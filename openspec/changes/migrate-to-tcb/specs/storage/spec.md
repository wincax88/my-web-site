## ADDED Requirements

### Requirement: TCB 云存储文件上传

系统 SHALL 使用腾讯云 TCB 云存储存储用户上传的媒体文件。

#### Scenario: 图片上传成功

- **WHEN** 管理员上传封面图片
- **THEN** 图片通过 TCB SDK 上传到云存储
- **AND** 返回可公开访问的图片 URL
- **AND** URL 格式为 TCB 云存储地址

#### Scenario: 图片压缩上传

- **WHEN** 上传的图片超过 5MB
- **THEN** 系统使用 sharp 压缩图片
- **AND** 压缩后上传到 TCB 云存储

#### Scenario: 上传失败处理

- **WHEN** TCB 云存储上传失败
- **THEN** 返回 500 错误响应
- **AND** 包含错误详情（开发环境）

### Requirement: TCB 云存储文件访问

系统 SHALL 支持通过 TCB CDN 加速访问存储的文件。

#### Scenario: 访问已上传文件

- **WHEN** 用户访问封面图片 URL
- **THEN** 通过 TCB CDN 返回图片内容
- **AND** 支持浏览器缓存
