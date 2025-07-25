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

    // 如果是群发模式，逐个发送给每个收件人
    if (isBulk && recipients.length > 1) {
      const results = [];
      
      for (const recipient of recipients) {
        try {
          const result = await sendSingleEmail(recipient, subject, html);
          results.push({
            email: recipient,
            success: true,
            messageId: result.id
          });
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
            to: recipients.join(', '),
            subject,
            content: html,
            sent_by: userData.id,
            customer_ids: customerIds,
          });
      }

      // 更新用户统计 - 群发时发送次数只算1次，收件人数+成功发送的数量
      if (successCount > 0) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users/update-stats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userId}`,
            },
            body: JSON.stringify({
              userId: userData.id,
              sendCount: 1, // 群发时发送次数只算1次
              recipientCount: successCount, // 实际成功发送的收件人数
            }),
          });
        } catch (statsError) {
          console.error('更新用户统计失败:', statsError);
          // 不阻止邮件发送流程，只记录错误
        }
      }

      return NextResponse.json({
        success: successCount > 0,
        message: `发送完成。成功: ${successCount}, 失败: ${failCount}`,
        results,
        totalSent: successCount,
        totalFailed: failCount
      });
    } else {
      // 单发模式
      const recipient = recipients[0];
      const result = await sendSingleEmail(recipient, subject, html);
      
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

      // 更新用户统计 - 单发模式发送次数+1，收件人数+1
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users/update-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`,
          },
          body: JSON.stringify({
            userId: userData.id,
            sendCount: 1, // 单发模式发送次数+1
            recipientCount: 1, // 单发模式收件人数+1
          }),
        });
      } catch (statsError) {
        console.error('更新用户统计失败:', statsError);
        // 不阻止邮件发送流程，只记录错误
      }
      
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

// 获取邮件列表 - 从数据库中查询邮件记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const authHeader = request.headers.get('authorization');

    console.log('邮件查询参数:', { q, maxResults });

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

    // 解析查询参数
    let fromEmail = '';
    let toEmail = '';
    
    if (q.includes('from:')) {
      const fromMatch = q.match(/from:([^\s]+)/);
      if (fromMatch) {
        fromEmail = fromMatch[1];
      }
    }
    
    if (q.includes('to:')) {
      const toMatch = q.match(/to:([^\s]+)/);
      if (toMatch) {
        toEmail = toMatch[1];
      }
    }

    console.log('解析的查询参数:', { fromEmail, toEmail });

    // 构建查询 - 直接查询customer_emails表
    let query = supabase
      .from('customer_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(maxResults);

    // 添加邮箱筛选
    if (fromEmail) {
      query = query.eq('from_email', fromEmail);
    }
    
    if (toEmail) {
      query = query.eq('to_email', toEmail);
    }

    // 如果不是管理员，需要权限过滤
    if (userData.role !== 'admin') {
      // 先获取用户有权限的客户ID列表
      const { data: userCustomers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('created_by', userId);

      if (customerError) {
        console.error('获取用户客户失败:', customerError);
        return NextResponse.json(
          { error: '获取用户客户失败' },
          { status: 500 }
        );
      }

      const userCustomerIds = userCustomers?.map(c => c.id) || [];
      
      if (userCustomerIds.length > 0) {
        query = query.in('customer_id', userCustomerIds);
      } else {
        // 如果用户没有客户，返回空结果
        return NextResponse.json({
          messages: [],
          nextPageToken: null,
          resultSizeEstimate: 0
        });
      }
    }

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

    return NextResponse.json({
      messages,
      nextPageToken: null,
      resultSizeEstimate: messages.length
    });

  } catch (error) {
    console.error('获取邮件列表失败:', error);
    return NextResponse.json(
      { error: '获取邮件列表失败' },
      { status: 500 }
    );
  }
} 