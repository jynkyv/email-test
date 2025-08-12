import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSingleEmail, sendBulkEmails } from '@/lib/sendgrid';

// 发送邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, isBulk = false, customerIds = [] } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证用户权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从 authorization header 中获取用户 ID
    const userId = authHeader.replace('Bearer ', '');
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 确保 to 是数组
    const recipients = Array.isArray(to) ? to : [to];
    
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: '没有有效的收件人' },
        { status: 400 }
      );
    }

    // 检查收件人是否已退订
    const { data: unsubscribedEmails, error: unsubscribeError } = await supabase
      .from('customers')
      .select('email')
      .in('email', recipients)
      .eq('unsubscribe', true);

    if (unsubscribeError) {
      console.error('检查退订状态失败:', unsubscribeError);
      return NextResponse.json(
        { error: '检查退订状态失败' },
        { status: 500 }
      );
    }

    // 过滤掉已退订的邮箱
    const unsubscribedEmailList = unsubscribedEmails?.map(c => c.email) || [];
    const validRecipients = recipients.filter(email => !unsubscribedEmailList.includes(email));

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: '所有收件人都已退订' },
        { status: 400 }
      );
    }

    // 如果有退订的邮箱，记录日志
    if (unsubscribedEmailList.length > 0) {
      console.log('跳过已退订的邮箱:', unsubscribedEmailList);
    }

    // 如果是群发模式，逐个发送给每个收件人
    if (isBulk && validRecipients.length > 1) {
      const results = [];
      
      for (const recipient of validRecipients) {
        try {
          const result = await sendSingleEmail(recipient, subject, html);
          results.push({
            email: recipient,
            success: true,
            messageId: result.id
          });
          
          // 记录发送的邮件到customer_emails表
          await recordSentEmail(recipient, subject, html, userData.id, result.id);
          
        } catch (error) {
          console.error(`发送邮件给 ${recipient} 失败:`, error);
          results.push({
            email: recipient,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      // 记录邮件日志
      if (customerIds.length > 0) {
        await supabase
          .from('email_logs')
          .insert({
            to: validRecipients.join(', '),
            subject,
            content: html,
            sent_by: userData.id,
            customer_ids: customerIds,
          });
      }

      // 注意：邮件统计数据通过实时查询 email_approvals 表计算，无需手动更新

      return NextResponse.json({
        success: successCount > 0,
        message: `发送完成。成功: ${successCount}, 失败: ${failCount}`,
        results,
        totalSent: successCount,
        totalFailed: failCount
      });
    } else {
      // 单发模式
      const recipient = validRecipients[0];
      const result = await sendSingleEmail(recipient, subject, html);
      
      // 记录发送的邮件到customer_emails表
      await recordSentEmail(recipient, subject, html, userData.id, result.id);
      
      // 记录邮件日志
      if (customerIds.length > 0) {
        await supabase
          .from('email_logs')
          .insert({
            to: recipient,
            subject,
            content: html,
            sent_by: userData.id,
            customer_ids: customerIds,
          });
      }

      // 注意：邮件统计数据通过实时查询 email_approvals 表计算，无需手动更新
      
      return NextResponse.json({
        success: true,
        messageId: result.id,
        message: '邮件发送成功'
      });
    }

  } catch (error) {
    console.error('发送邮件失败:', error);
    
    let errorMessage = '发送邮件失败';
    const errorObj = error as any;
    
    if (errorObj.code === 'ECONNRESET') {
      errorMessage = '网络连接被重置，请检查代理设置';
    } else if (errorObj.code === 'ETIMEDOUT') {
      errorMessage = '网络连接超时，请检查网络和代理';
    } else if (errorObj.message?.includes('sendgrid')) {
      errorMessage = 'SendGrid服务连接失败，请检查API配置';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorObj.message },
      { status: 500 }
    );
  }
}

// 记录发送的邮件到customer_emails表
async function recordSentEmail(toEmail: string, subject: string, content: string, sentBy: string, messageId: string) {
  try {
    // 查找对应的客户
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', toEmail)
      .single();

    if (customerError || !customer) {
      console.log('收件人不是客户，跳过记录:', toEmail);
      return;
    }

    // 获取发送者的邮箱（从用户表或环境变量）
    const { data: senderUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', sentBy)
      .single();

    const fromEmail = senderUser?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';

    // 插入发送的邮件记录
    const { error: insertError } = await supabase
      .from('customer_emails')
      .insert({
        customer_id: customer.id,
        from_email: fromEmail,
        to_email: toEmail,
        subject: subject || '无主题',
        content: content || '',
        message_id: messageId,
        is_read: true, // 发送的邮件默认标记为已读
        direction: 'outbound' // 标记为发出的邮件
      });

    if (insertError) {
      console.error('记录发送邮件失败:', insertError);
    } else {
      console.log('✅ 发送邮件记录成功:', { customerId: customer.id, toEmail, messageId });
    }
  } catch (error) {
    console.error('记录发送邮件时出错:', error);
  }
}

// 获取邮件列表 - 从数据库中查询邮件记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const customerId = searchParams.get('customerId'); // 添加客户ID参数
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const authHeader = request.headers.get('authorization');

    console.log('邮件查询参数:', { q, customerId, maxResults });

    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 构建查询 - 直接查询customer_emails表
    let query = supabase
      .from('customer_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(maxResults);

    // 如果提供了客户ID，按客户ID过滤
    if (customerId) {
      query = query.eq('customer_id', customerId);
    } else {
      // 如果没有提供客户ID，解析查询参数中的邮箱
      let fromEmail = '';
      let toEmail = '';
      
      if (q.includes('from:')) {
        const fromMatch = q.match(/from:([^\s]+)/);
        if (fromMatch) {
          fromEmail = fromMatch[1].replace(/['"]/g, '');
        }
      }
      
      if (q.includes('to:')) {
        const toMatch = q.match(/to:([^\s]+)/);
        if (toMatch) {
          toEmail = toMatch[1].replace(/['"]/g, '');
        }
      }

      // 添加邮箱筛选
      if (fromEmail) {
        query = query.eq('from_email', fromEmail);
      }
      
      if (toEmail) {
        query = query.eq('to_email', toEmail);
      }
    }

    console.log('查询邮件，不进行权限过滤');

    const { data: emails, error } = await query;

    console.log('邮件查询结果:', { 
      emailsCount: emails?.length, 
      error: error?.message,
      emails: emails?.map(e => ({ id: e.id, from: e.from_email, to: e.to_email, subject: e.subject }))
    });

    if (error) {
      console.error('查询邮件失败:', error);
      return NextResponse.json(
        { error: '查询邮件失败' },
        { status: 500 }
      );
    }

    // 转换格式以匹配Gmail API格式
    const messages = emails?.map(email => ({
      id: email.id,
      threadId: email.message_id || email.id,
      labelIds: email.is_read ? ['INBOX', 'READ'] : ['INBOX', 'UNREAD'],
      snippet: email.content?.substring(0, 100) || '',
      payload: {
        headers: [
          { name: 'From', value: email.from_email },
          { name: 'To', value: email.to_email },
          { name: 'Subject', value: email.subject || '无主题' },
          { name: 'Date', value: new Date(email.created_at).toISOString() }
        ],
        body: {
          data: Buffer.from(email.content || '').toString('base64')
        }
      },
      internalDate: new Date(email.created_at).getTime().toString()
    })) || [];

    console.log('转换后的消息:', { 
      messagesCount: messages.length,
      messages: messages.map(m => ({ id: m.id, from: m.payload.headers.find(h => h.name === 'From')?.value }))
    });

    const response = {
      success: true,
      messages,
      nextPageToken: null,
      resultSizeEstimate: messages.length
    };

    console.log('最终响应:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('获取邮件列表失败:', error);
    return NextResponse.json(
      { error: '获取邮件列表失败' },
      { status: 500 }
    );
  }
} 