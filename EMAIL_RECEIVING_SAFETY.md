# 邮件接收安全机制

## 概述

本文档详细说明了邮件接收系统的安全机制，确保不会发生丢件情况。

## 收件流程安全机制

### 1. Webhook接收安全

#### 1.1 重复邮件检查
- 使用 `message-id` 检查是否已存在相同邮件
- 如果邮件已存在，直接返回成功，避免重复处理

```typescript
// 检查是否已存在相同message-id的邮件
if (messageId) {
  const { data: existingEmail } = await supabaseAdmin
    .from('customer_emails')
    .select('id')
    .eq('message_id', messageId)
    .single();

  if (existingEmail) {
    console.log('⚠️ 邮件已存在，跳过处理:', messageId);
    return NextResponse.json({ success: true, message: '邮件已存在' });
  }
}
```

#### 1.2 客户验证
- 只有来自已注册客户的邮件才会被处理
- 非客户邮件会被安全丢弃，避免垃圾邮件

#### 1.3 错误处理
- 所有数据库操作都有完整的错误处理
- 如果插入失败，返回500错误，SendGrid会重试

### 2. 邮件队列处理安全

#### 2.1 处理中状态清理
- 每次处理前清理超过5分钟的处理中状态邮件
- 防止邮件卡在处理中状态

```typescript
// 首先清理长时间处于处理中状态的邮件（超过5分钟）
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
await supabase
  .from('email_queue')
  .update({ 
    status: 'pending',
    processed_at: null
  })
  .eq('status', 'processing')
  .lt('processed_at', fiveMinutesAgo);
```

#### 2.2 重试机制
- 最多重试3次
- 每次失败都会增加重试计数
- 超过重试次数的邮件标记为失败

```typescript
.lte('retry_count', 3)  // 最多重试3次
```

#### 2.3 状态管理
- 邮件状态：`pending` → `processing` → `sent`/`failed`
- 每个状态变更都有时间戳记录
- 异常情况下确保状态正确更新

#### 2.4 异常处理
- 处理过程中的任何异常都会被捕获
- 确保邮件状态被正确更新为失败
- 避免邮件卡在处理中状态

```typescript
} catch (error) {
  console.error(`处理邮件 ${email.id} 失败:`, error);
  
  // 确保邮件状态被正确更新，避免卡在处理中状态
  try {
    await supabase
      .from('email_queue')
      .update({ 
        status: 'failed',
        error_message: '处理过程中发生异常',
        retry_count: email.retry_count + 1,
        processed_at: new Date().toISOString()
      })
      .eq('id', email.id);
  } catch (updateError) {
    console.error(`更新邮件 ${email.id} 状态失败:`, updateError);
  }
}
```

### 3. 数据库事务安全

#### 3.1 邮件记录
- 所有邮件都会记录到 `customer_emails` 表
- 包含完整的邮件信息和状态
- 支持邮件方向标记（inbound/outbound）

#### 3.2 客户状态更新
- 收到邮件时自动更新客户未读状态
- 标记为已读时检查是否还有其他未读邮件

### 4. 监控和日志

#### 4.1 详细日志
- 每个处理步骤都有详细日志
- 包含邮件ID、客户ID、处理时间等信息
- 便于问题排查和监控

#### 4.2 状态监控
- 实时监控队列状态
- 显示待处理、处理中、已发送、失败的数量
- 支持进度显示

## 防丢件机制总结

1. **重复检查**：通过message-id防止重复处理
2. **状态管理**：完整的状态流转和异常处理
3. **重试机制**：失败邮件自动重试
4. **清理机制**：定期清理卡住的处理中状态
5. **事务安全**：确保数据库操作的一致性
6. **监控日志**：完整的操作记录便于排查

## 建议的最佳实践

1. **定期监控**：定期检查队列状态和失败邮件
2. **日志分析**：定期分析处理日志，发现潜在问题
3. **容量规划**：根据邮件量调整处理批次大小
4. **备份策略**：定期备份邮件数据
5. **告警机制**：设置失败率告警

## 故障排查

### 常见问题

1. **邮件卡在处理中状态**
   - 检查处理中状态清理机制是否正常工作
   - 查看服务器日志是否有异常

2. **邮件丢失**
   - 检查webhook是否正常接收
   - 查看SendGrid的webhook日志
   - 检查数据库连接是否正常

3. **重复邮件**
   - 检查message-id是否唯一
   - 查看重复检查逻辑是否正常

### 排查步骤

1. 检查webhook接收日志
2. 查看队列处理日志
3. 检查数据库中的邮件记录
4. 验证客户信息是否正确
5. 检查SendGrid配置

通过以上安全机制，系统能够确保邮件的可靠接收和处理，最大程度避免丢件情况的发生。 