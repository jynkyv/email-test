# 邮件发送统计功能

## 功能概述

本功能为员工添加了邮件发送统计，包括：
- **总发送邮件次数**：以点击发送按钮为准，每次点击算一次
- **总发送信件数**：实际成功发送的收件人数

## 数据库变更

### 需要执行的SQL脚本

请在Supabase的SQL编辑器中执行以下脚本：

```sql
-- 为users表添加邮件发送统计字段
-- 这个脚本需要在Supabase中执行

-- 添加邮件发送次数字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_send_count INTEGER DEFAULT 0;

-- 添加邮件收件人数字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_recipient_count INTEGER DEFAULT 0;

-- 为现有用户设置默认值
UPDATE users 
SET 
  email_send_count = COALESCE(email_send_count, 0),
  email_recipient_count = COALESCE(email_recipient_count, 0)
WHERE email_send_count IS NULL OR email_recipient_count IS NULL;

-- 添加注释
COMMENT ON COLUMN users.email_send_count IS '用户总发送邮件次数（以点击发送按钮为准）';
COMMENT ON COLUMN users.email_recipient_count IS '用户总发送信件数（实际收件人数）';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email_send_count ON users(email_send_count);
CREATE INDEX IF NOT EXISTS idx_users_email_recipient_count ON users(email_recipient_count);
```

## 新增文件

### 1. API路由
- `app/api/users/update-stats/route.ts` - 更新用户邮件发送统计的API

### 2. 组件更新
- `app/components/UserManager.tsx` - 添加了邮件发送统计列显示

### 3. 翻译文件
- `locales/zh.json` - 添加了中文翻译
- `locales/ja.json` - 添加了日文翻译

### 4. 测试脚本
- `scripts/test-email-stats.js` - 功能测试脚本

## 功能说明

### 统计逻辑

1. **发送次数统计**：
   - **单发模式**：每次点击发送按钮，发送次数+1
   - **群发模式**：每次点击发送按钮，发送次数+1（无论发送给多少个收件人，都只算1次发送操作）
   - 发送次数反映的是用户的操作次数，而不是实际发送的邮件数量

2. **收件人数统计**：
   - **单发模式**：收件人数+1
   - **群发模式**：收件人数+实际成功发送的邮件数量
   - 收件人数反映的是实际成功发送的邮件数量

### 示例场景

假设用户进行群发操作，选择了4个收件人：

- **发送次数**：+1（因为只点击了一次发送按钮）
- **收件人数**：+4（如果4个邮件都发送成功）

这样统计更准确地反映了用户的实际操作行为。

### 权限控制

- 只有管理员或用户本人可以更新统计
- 统计更新失败不会影响邮件发送流程

### 界面显示

在用户管理页面新增了两列：
- **发送次数**：显示用户总发送邮件次数
- **收件人数**：显示用户总发送信件数

## 使用方法

### 1. 执行数据库脚本

首先在Supabase中执行上述SQL脚本。

### 2. 测试功能

运行测试脚本验证功能：

```bash
# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
export NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 运行测试
node scripts/test-email-stats.js
```

### 3. 正常使用

1. 登录系统
2. 进入邮件发送页面
3. 发送邮件（单发或群发）
4. 系统会自动更新发送统计
5. 在用户管理页面查看统计结果

## 环境变量

确保在 `.env.local` 文件中设置：

```env
# 应用配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 注意事项

1. **统计准确性**：统计基于实际发送成功的情况，发送失败的邮件不计入统计
2. **操作逻辑**：发送次数反映用户操作次数，收件人数反映实际发送数量
3. **权限安全**：只有管理员和用户本人可以更新统计，确保数据安全
4. **错误处理**：统计更新失败不会影响邮件发送流程
5. **性能优化**：添加了数据库索引以提高查询性能

## 故障排除

### 常见问题

1. **统计不更新**：
   - 检查数据库脚本是否执行成功
   - 检查环境变量是否正确设置
   - 查看浏览器控制台是否有错误信息

2. **权限错误**：
   - 确保用户已正确登录
   - 检查用户角色权限

3. **API调用失败**：
   - 检查网络连接
   - 验证API路由是否正确配置

### 调试方法

1. 查看浏览器开发者工具的网络面板
2. 检查服务器日志
3. 运行测试脚本验证功能

## 更新日志

- **v1.0.0**: 初始版本，支持基本的邮件发送统计功能
- 添加了发送次数和收件人数统计
- 集成了多语言支持
- 添加了权限控制和错误处理
- **v1.1.0**: 优化群发统计逻辑，确保发送次数只算1次 