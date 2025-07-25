import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        fromEmail = fromEmail.replace(/['"]/g, '');
      }
    }
    
    if (q.includes('to:')) {
      const toMatch = q.match(/to:([^\s]+)/);
      if (toMatch) {
        toEmail = toMatch[1];
        toEmail = toEmail.replace(/['"]/g, '');
      }
    }

    console.log('解析的查询参数:', { fromEmail, toEmail });

    // 构建查询 - 直接查询customer_emails表，不进行权限过滤
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

    // 移除权限过滤逻辑 - 所有用户都可以查看邮件
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

// 标记邮件为已读
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const customerId = params.id;
    const body = await request.json();
    const { emailIds } = body; // 要标记为已读的邮件ID数组

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    // 检查权限
    if (user.role !== 'admin') {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('created_by')
        .eq('id', customerId)
        .single();

      if (customerError || customer.created_by !== userId) {
        return NextResponse.json({ error: '权限不足' }, { status: 403 });
      }
    }

    // 标记邮件为已读
    const { error: updateError } = await supabase
      .from('customer_emails')
      .update({ is_read: true })
      .in('id', emailIds)
      .eq('customer_id', customerId);

    if (updateError) {
      console.error('更新邮件状态失败:', updateError);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    // 检查是否还有未读邮件
    const { data: unreadCount, error: countError } = await supabase
      .from('customer_emails')
      .select('id', { count: 'exact' })
      .eq('customer_id', customerId)
      .eq('is_read', false);

    if (countError) {
      console.error('检查未读邮件数量失败:', countError);
    } else {
      // 更新客户的未读状态
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ has_unread_emails: unreadCount && unreadCount.length > 0 })
        .eq('id', customerId);

      if (customerUpdateError) {
        console.error('更新客户未读状态失败:', customerUpdateError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: '邮件已标记为已读',
      unreadCount: unreadCount?.length || 0
    });

  } catch (error) {
    console.error('标记邮件为已读失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
} 