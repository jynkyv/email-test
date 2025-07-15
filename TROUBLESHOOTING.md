# Google OAuth 故障排除指南

## 常见错误及解决方案

### 错误1: "Missing required parameter: redirect_uri"

**原因**: Google Cloud Console 中没有正确配置重定向URI

**解决方案**:
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 "API和服务" → "凭据"
4. 找到您的 OAuth 2.0 客户端ID，点击编辑
5. 在 "已获授权的重定向 URI" 部分，添加：
   ```
   http://localhost:3000/api/auth/callback
   ```
6. 保存更改

### 错误2: "Required parameter is missing: response_type"

**原因**: 授权URL格式错误

**解决方案**: 使用我们提供的脚本，它会生成正确格式的URL

### 错误3: "发生了授权错误"

**原因**: 通常是因为重定向URI不匹配或scope参数格式错误

**解决方案**:
1. 确保重定向URI完全匹配
2. 使用URL编码的scope参数

## 完整的配置检查清单

### 1. Google Cloud Console 配置
- [ ] 创建了项目
- [ ] 启用了 Gmail API
- [ ] 创建了 OAuth 2.0 客户端ID（Web应用类型）
- [ ] 添加了重定向URI: `http://localhost:3000/api/auth/callback`

### 2. 授权URL格式
确保URL包含所有必需参数：
```
https://accounts.google.com/o/oauth2/v2/auth?
client_id=YOUR_CLIENT_ID&
redirect_uri=http://localhost:3000/api/auth/callback&
scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.readonly&
response_type=code&
access_type=offline&
prompt=consent
```

### 3. 环境变量配置
创建 `.env.local` 文件：
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_EMAIL=fishmooger@gmail.com
```

## 使用自动化工具

运行以下命令使用我们的自动化工具：

```bash
# 检查配置
node scripts/check-config.js

# 获取刷新令牌
pnpm run auth
```

## 手动获取刷新令牌的步骤

如果自动化工具不工作，可以手动操作：

1. 构建授权URL（替换YOUR_CLIENT_ID）：
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/callback&scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.readonly&response_type=code&access_type=offline&prompt=consent
```

2. 在浏览器中访问此URL并授权

3. 从重定向URL中提取授权码

4. 使用curl获取刷新令牌：
```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/api/auth/callback"
```

## 测试配置

配置完成后，运行：
```bash
pnpm dev
```

访问 http://localhost:3000 测试邮件功能。 