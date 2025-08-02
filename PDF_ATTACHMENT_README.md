# PDF附件功能说明

## 功能概述

邮件系统现已支持PDF附件功能，允许用户在发送邮件时添加PDF文件作为附件。

## 功能特性

### 1. 文件上传
- **文件类型限制**：仅支持PDF文件
- **文件大小限制**：单个文件最大10MB
- **数量限制**：最多可上传5个附件
- **实时上传**：选择文件后立即开始上传

### 2. 文件存储
- 使用Supabase Storage进行文件存储
- 文件存储在`email-attachments`存储桶中
- 生成唯一的文件名避免冲突
- 提供公共访问URL

### 3. 用户界面
- 在邮件发送界面添加附件上传区域
- 显示附件列表，包含文件名、大小和状态
- 支持删除已上传的附件
- 显示上传进度和状态

### 4. 审核流程
- 附件信息会随邮件一起提交审核
- 审核页面显示附件列表
- 管理员可以查看附件信息

## 技术实现

### 前端组件
- `EmailSender.tsx`：添加附件上传UI和逻辑
- `approvals/page.tsx`：在审核页面显示附件信息

### 后端API
- `/api/upload`：处理文件上传
- `/api/email-approvals`：支持附件数据存储

### 数据库结构
- `email_approvals`表添加`attachments`字段（JSON类型）
- 存储附件的基本信息（名称、大小、类型、URL等）

## 使用流程

1. **上传附件**
   - 点击"添加PDF附件"按钮
   - 选择PDF文件（最大10MB）
   - 系统自动开始上传
   - 上传完成后显示在附件列表中

2. **管理附件**
   - 查看已上传的附件列表
   - 点击删除按钮移除不需要的附件
   - 最多可添加5个附件

3. **发送邮件**
   - 附件信息会随邮件一起提交审核
   - 审核通过后，附件会随邮件一起发送

## 配置要求

### Supabase Storage
需要在Supabase中创建`email-attachments`存储桶：

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-attachments', 'email-attachments', true);

-- 设置存储策略（可选）
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'email-attachments');
```

### 数据库表结构
确保`email_approvals`表包含`attachments`字段：

```sql
ALTER TABLE email_approvals 
ADD COLUMN attachments JSONB DEFAULT '[]';
```

## 安全考虑

1. **文件类型验证**：仅允许PDF文件
2. **文件大小限制**：防止大文件上传
3. **用户认证**：上传需要用户登录
4. **唯一文件名**：避免文件名冲突
5. **错误处理**：完善的错误提示和处理

## 未来扩展

1. **更多文件类型**：支持Word、Excel等文档格式
2. **文件预览**：在审核页面预览PDF内容
3. **批量上传**：支持一次选择多个文件
4. **文件压缩**：自动压缩大文件
5. **版本控制**：支持附件版本管理

## 故障排除

### 常见问题

1. **上传失败**
   - 检查文件是否为PDF格式
   - 确认文件大小不超过10MB
   - 检查网络连接

2. **存储桶不存在**
   - 在Supabase中创建`email-attachments`存储桶
   - 确保存储桶为公开访问

3. **权限错误**
   - 确认用户已登录
   - 检查Supabase存储策略设置

### 调试信息
- 查看浏览器控制台的错误信息
- 检查网络请求的响应状态
- 查看Supabase存储日志 