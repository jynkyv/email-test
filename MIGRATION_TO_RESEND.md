# 从 Gmail 迁移到 Resend 指南

## 迁移概述

本指南将帮助您将邮件发送服务从 Gmail API 迁移到 Resend。

## 已完成的工作

✅ 安装 Resend SDK  
✅ 创建 Resend 邮件服务 (`lib/resend.ts`)  
✅ 更新邮件发送 API (`app/api/email/route.ts`)  
✅ 更新邮件队列处理 API (`app/api/email-queue/process/route.ts`)  
✅ 更新环境变量配置  
✅ 创建测试脚本  

## 迁移步骤

### 1. 设置 Resend 账户

1. 访问 [Resend官网](https://resend.com) 注册账户
2. 获取 API Key
3. 验证发件人域名
4. 参考 `RESEND_SETUP.md` 完成详细设置

### 2. 配置环境变量

在 `.env.local` 文件中添加：

```env
# Resend 邮件服务配置
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. 测试配置

运行测试脚本验证配置：

```bash
pnpm test-resend
```

### 4. 清理旧配置（可选）

完成测试后，可以删除 Gmail 相关配置：

```bash
# 删除 Gmail 相关环境变量
# 从 .env.local 中删除：
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET  
# GOOGLE_REDIRECT_URI
# GOOGLE_REFRESH_TOKEN
# GOOGLE_EMAIL

# 卸载 Gmail 相关包（可选）
pnpm remove googleapis nodemailer @types/nodemailer
```

## 功能对比

| 功能 | Gmail API | Resend | 状态 |
|------|-----------|--------|------|
| 单发邮件 | ✅ | ✅ | 已迁移 |
| 群发邮件 | ✅ | ✅ | 已迁移 |
| 邮件队列 | ✅ | ✅ | 已迁移 |
| 邮件接收 | ✅ | ❌ | 已禁用 |
| 附件支持 | ✅ | ✅ | 已支持 |
| HTML 邮件 | ✅ | ✅ | 已支持 |
| 多语言支持 | ✅ | ✅ | 已支持 |

## 主要变化

### 1. 简化的 API

**之前 (Gmail):**
```javascript
// 复杂的 OAuth2 配置
const oauth2Client = new google.auth.OAuth2(...);
oauth2Client.setCredentials({ refresh_token: ... });
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// 复杂的邮件构建
const message = {
  raw: Buffer.from(emailContent, 'utf-8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
};
```

**现在 (Resend):**
```javascript
// 简单的 API Key 配置
const resend = new Resend(process.env.RESEND_API_KEY);

// 简单的邮件发送
const { data, error } = await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: ['recipient@example.com'],
  subject: '邮件主题',
  html: '<h1>邮件内容</h1>'
});
```

### 2. 更好的错误处理

Resend 提供更清晰的错误信息：
- `Invalid API key`: API Key 错误
- `Domain not verified`: 域名未验证
- `Rate limit exceeded`: 超出发送限制

### 3. 更快的发送速度

Resend 的发送速度比 Gmail API 更快，特别是在批量发送时。

## 注意事项

1. **邮件接收功能**: Resend 不提供邮件接收功能，相关 API 已禁用
2. **发件人域名**: 必须使用已验证的域名作为发件人
3. **发送限制**: 注意 Resend 的免费额度限制
4. **测试**: 建议先在测试环境验证功能

## 故障排除

### 常见问题

1. **API Key 错误**
   - 检查 `RESEND_API_KEY` 是否正确
   - 确认 API Key 没有多余的空格

2. **域名未验证**
   - 在 Resend 控制台验证发件人域名
   - 或使用 `@resend.dev` 域名进行测试

3. **发送失败**
   - 检查收件人邮箱格式
   - 查看 Resend 控制台的发送日志

### 调试命令

```bash
# 测试 Resend 配置
pnpm test-resend

# 查看应用日志
pnpm dev
```

## 完成迁移

完成以上步骤后，您的应用将使用 Resend 发送邮件，享受更简单、更快速的邮件发送服务！ 