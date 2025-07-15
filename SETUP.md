# Google邮件服务配置指南

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
GOOGLE_EMAIL=your_email@gmail.com
```

## 获取Google API凭据

### 1. 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Gmail API：
   - 进入 "API和服务" → "库"
   - 搜索 "Gmail API" 并启用

### 2. 创建OAuth2凭据
1. 进入 "API和服务" → "凭据"
2. 点击 "创建凭据" → "OAuth 2.0 客户端ID"
3. 选择应用类型：**Web应用**
4. 配置重定向URI：`http://localhost:3000/api/auth/callback`
5. 创建后获得：
   - **GOOGLE_CLIENT_ID**：客户端ID
   - **GOOGLE_CLIENT_SECRET**：客户端密钥

### 3. 获取刷新令牌（推荐使用自动化工具）

运行以下命令使用自动化工具获取刷新令牌：

```bash
pnpm run get-token
```

按照提示输入您的 Client ID 和 Client Secret，然后按照步骤操作。

### 4. 手动获取刷新令牌（备选方案）

1. 在浏览器中访问：
```
https://accounts.google.com/o/oauth2/v2/auth?
client_id=YOUR_CLIENT_ID&
redirect_uri=http://localhost:3000/api/auth/callback&
scope=https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly&
response_type=code&
access_type=offline&
prompt=consent
```

2. 授权后，从重定向URL中提取授权码

3. 使用curl获取刷新令牌：
```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/api/auth/callback"
```

## 功能特性

- ✅ 单发邮件
- ✅ 群发邮件
- ✅ 查看收件箱
- ✅ 搜索邮件
- ✅ 查看邮件详情
- ✅ 现代化UI界面

## 启动项目

```bash
pnpm dev
```

访问 http://localhost:3000 即可使用邮件管理系统。 