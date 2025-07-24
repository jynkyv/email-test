# Resend 邮件服务设置指南

## 1. 注册 Resend 账户

1. 访问 [Resend官网](https://resend.com)
2. 注册一个免费账户
3. 验证您的邮箱地址

## 2. 获取 API Key

1. 登录 Resend 控制台
2. 进入 "API Keys" 页面
3. 点击 "Create API Key"
4. 复制生成的 API Key

## 3. 验证发件人域名

### 方法一：使用 Resend 提供的域名
1. 在 Resend 控制台中找到 "Domains" 页面
2. 使用默认的 `@resend.dev` 域名
3. 设置发件人邮箱为：`noreply@resend.dev`

### 方法二：验证自己的域名
1. 在 "Domains" 页面点击 "Add Domain"
2. 输入您的域名（如：`yourdomain.com`）
3. 按照提示添加 DNS 记录
4. 等待验证完成

## 4. 配置环境变量

在您的 `.env.local` 文件中添加：

```env
# Resend 邮件服务配置
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## 5. 测试邮件发送

1. 启动应用
2. 尝试发送测试邮件
3. 检查 Resend 控制台的 "Logs" 页面查看发送状态

## 6. 免费额度

- 每月免费发送 3,000 封邮件
- 每天最多发送 100 封邮件
- 支持 HTML 和纯文本邮件
- 支持附件（最大 10MB）

## 7. 故障排除

### 常见错误

1. **Invalid API Key**: 检查 API Key 是否正确
2. **Domain not verified**: 确保发件人域名已验证
3. **Rate limit exceeded**: 超出发送限制，等待或升级账户

### 调试步骤

1. 检查环境变量是否正确设置
2. 查看应用日志中的错误信息
3. 在 Resend 控制台查看发送日志
4. 确认发件人邮箱格式正确

## 8. 从 Gmail 迁移

完成 Resend 设置后，您可以：

1. 删除 Gmail 相关的环境变量
2. 卸载 `googleapis` 和 `nodemailer` 包（可选）
3. 更新发件人邮箱地址

## 9. 优势对比

| 特性 | Gmail API | Resend |
|------|-----------|--------|
| 设置复杂度 | 复杂（OAuth2） | 简单（API Key） |
| 免费额度 | 每天 500 封 | 每月 3,000 封 |
| 发送速度 | 较慢 | 快速 |
| 可靠性 | 高 | 高 |
| 监控功能 | 基础 | 丰富 |
| 支持语言 | 多语言 | 多语言 | 