# Vercel 部署指南

## 📋 部署前准备清单

### 1. 代码准备
- [x] 项目代码完整
- [x] `package.json` 配置正确
- [x] `next.config.js` 配置正确
- [x] TypeScript 配置正确
- [x] 所有依赖已安装

### 2. 环境变量准备

#### 必需的环境变量

```env
# Google OAuth2 配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_EMAIL=your_email@gmail.com

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 应用配置
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### 重要提醒
- 将 `GOOGLE_REDIRECT_URI` 改为您的 Vercel 域名
- 将 `NEXT_PUBLIC_BASE_URL` 改为您的 Vercel 域名
- 确保所有敏感信息都已正确配置

### 3. 数据库准备

#### Supabase 配置
1. 确保 Supabase 项目已创建
2. 执行数据库脚本（邮件统计功能）：
   ```sql
   -- 为users表添加邮件发送统计字段
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS email_send_count INTEGER DEFAULT 0;
   
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS email_recipient_count INTEGER DEFAULT 0;
   
   UPDATE users 
   SET 
     email_send_count = COALESCE(email_send_count, 0),
     email_recipient_count = COALESCE(email_recipient_count, 0)
   WHERE email_send_count IS NULL OR email_recipient_count IS NULL;
   ```

#### Google OAuth2 配置
1. 在 Google Cloud Console 中添加您的 Vercel 域名
2. 更新 OAuth2 重定向 URI
3. 确保刷新令牌有效

### 4. 文件检查清单

确保以下文件存在且配置正确：
- [x] `package.json`
- [x] `next.config.js`
- [x] `tsconfig.json`
- [x] `tailwind.config.js`
- [x] `postcss.config.js`
- [x] `.gitignore`
- [x] `README.md`

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择您的 GitHub 仓库
   - 选择 "Next.js" 框架

3. **配置项目**
   - Project Name: `email-test` (或您想要的名称)
   - Framework Preset: `Next.js`
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (默认)
   - Output Directory: `.next` (默认)

4. **设置环境变量**
   - 在 "Environment Variables" 部分添加所有必需的环境变量
   - 确保所有变量都已正确设置

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GOOGLE_REDIRECT_URI
   vercel env add GOOGLE_REFRESH_TOKEN
   vercel env add GOOGLE_EMAIL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

## ⚙️ 部署后配置

### 1. 域名配置
- 在 Vercel Dashboard 中配置自定义域名（可选）
- 更新 Google OAuth2 重定向 URI
- 更新 `NEXT_PUBLIC_BASE_URL` 环境变量

### 2. 环境变量更新
部署后需要更新以下环境变量：
```env
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 3. 功能测试
部署完成后测试以下功能：
- [ ] 用户登录
- [ ] 邮件发送（单发）
- [ ] 邮件发送（群发）
- [ ] 员工管理
- [ ] 客户管理
- [ ] 邮件发送统计
- [ ] 多语言切换

## 🔧 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的依赖
   - 确保所有 TypeScript 错误已修复
   - 检查 `next.config.js` 配置

2. **环境变量错误**
   - 确保所有必需的环境变量都已设置
   - 检查环境变量名称是否正确
   - 确保敏感信息没有暴露在客户端

3. **API 路由错误**
   - 检查 API 路由是否正确配置
   - 确保 Supabase 连接正常
   - 验证 Google OAuth2 配置

4. **数据库连接问题**
   - 检查 Supabase URL 和密钥
   - 确保 RLS 策略配置正确
   - 验证数据库表结构

### 调试方法

1. **查看构建日志**
   - 在 Vercel Dashboard 中查看构建日志
   - 检查是否有 TypeScript 或 ESLint 错误

2. **检查运行时日志**
   - 在 Vercel Dashboard 中查看函数日志
   - 检查 API 路由的执行情况

3. **本地测试**
   - 使用 `vercel dev` 在本地测试
   - 确保本地环境变量配置正确

## 📝 部署检查清单

### 部署前
- [ ] 代码已提交到 GitHub
- [ ] 所有环境变量已准备
- [ ] 数据库脚本已执行
- [ ] Google OAuth2 配置已更新
- [ ] 本地测试通过

### 部署后
- [ ] 网站可以正常访问
- [ ] 用户登录功能正常
- [ ] 邮件发送功能正常
- [ ] 员工管理功能正常
- [ ] 客户管理功能正常
- [ ] 邮件统计功能正常
- [ ] 多语言功能正常

## 🔐 安全注意事项

1. **环境变量安全**
   - 确保敏感信息不会暴露在客户端
   - 使用 `SUPABASE_SERVICE_ROLE_KEY` 而不是 `NEXT_PUBLIC_` 前缀
   - 定期轮换密钥

2. **API 安全**
   - 确保所有 API 路由都有适当的认证
   - 验证用户权限
   - 防止 SQL 注入

3. **数据安全**
   - 确保 Supabase RLS 策略配置正确
   - 定期备份数据库
   - 监控异常访问

## 📞 支持

如果遇到部署问题：
1. 检查 Vercel 文档
2. 查看构建和运行时日志
3. 确保所有配置正确
4. 测试本地环境

部署完成后，您的邮件管理系统就可以在 Vercel 上正常运行了！ 