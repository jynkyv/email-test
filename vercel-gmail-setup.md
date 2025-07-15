# Vercel + Google 邮件服务配置流程

## 1. Google Cloud Console 配置

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入「API 和服务」→「凭据」
3. 创建 OAuth 2.0 客户端ID（类型选 Web 应用）
4. 在“已获授权的重定向 URI”里添加：
   - `https://your-vercel-project-name.vercel.app/api/auth/callback`
   - （可选）`http://localhost:3000/api/auth/callback`（本地开发用）

---

## 2. 获取 refresh_token（必须用线上 redirect_uri）

1. 拼接授权链接（用你的 client_id 和 Vercel 域名）：

   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=你的client_id&redirect_uri=https://your-vercel-project-name.vercel.app/api/auth/callback&scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.readonly&response_type=code&access_type=offline&prompt=consent
   ```

2. 浏览器打开，登录 Google 账号，授权后跳转到 Vercel 域名，URL 带有 `?code=xxxx`
3. 复制 code

4. 用 code 换 refresh_token（在终端执行）：

   ```bash
   curl -X POST https://oauth2.googleapis.com/token \
     -d "client_id=你的client_id" \
     -d "client_secret=你的client_secret" \
     -d "code=上一步拿到的code" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=https://your-vercel-project-name.vercel.app/api/auth/callback"
   ```

5. 响应中 `"refresh_token": "xxxxxx"` 就是你要用的 refresh_token

---

## 3. Vercel 环境变量配置

在 Vercel 项目后台添加如下环境变量：

```
GOOGLE_CLIENT_ID=你的client_id
GOOGLE_CLIENT_SECRET=你的client_secret
GOOGLE_REFRESH_TOKEN=上一步获取的refresh_token
GOOGLE_REDIRECT_URI=https://your-vercel-project-name.vercel.app/api/auth/callback
GOOGLE_EMAIL=你的gmail邮箱
```

---

## 4. 重新部署

- 修改完环境变量后，重新部署 Vercel 项目即可。

---

## 5. 测试

- 访问你的 Vercel 项目（如 https://your-vercel-project-name.vercel.app/ ）
- 测试发送和接收邮件功能

---

## 常见问题排查

- **401/unauthorized_client**：refresh_token 和 redirect_uri 不匹配，需用线上 redirect_uri 重新获取 refresh_token
- **ETIMEDOUT**：本地网络问题，Vercel 上不会有
- **redirect_uri_mismatch**：Google Cloud Console 没有添加对应的 redirect_uri

---

如需详细命令或遇到新问题，随时欢迎提问！ 