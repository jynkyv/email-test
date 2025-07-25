import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 更新邮件已读/未读状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const emailId = params.id;
    const body = await request.json();
    const { action } = body; // 'read' 或 'unread'

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    // 更新邮件状态
    const { data: email, error: updateError } = await supabase
      .from('customer_emails')
      .update({ is_read: action === 'read' })
      .eq('id', emailId)
      .select('customer_id')
      .single();

    if (updateError) {
      console.error('更新邮件状态失败:', updateError);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    // 检查该客户是否还有未读邮件
    const { data: unreadCount, error: countError } = await supabase
      .from('customer_emails')
      .select('id', { count: 'exact' })
      .eq('customer_id', email.customer_id)
      .eq('is_read', false);

    if (countError) {
      console.error('检查未读邮件数量失败:', countError);
    } else {
      // 更新客户的未读状态
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ has_unread_emails: unreadCount && unreadCount.length > 0 })
        .eq('id', email.customer_id);

      if (customerUpdateError) {
        console.error('更新客户未读状态失败:', customerUpdateError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `邮件已标记为${action === 'read' ? '已读' : '未读'}`,
      isRead: action === 'read'
    });

  } catch (error) {
    console.error('更新邮件状态失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

// 获取单个邮件详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '邮件ID不能为空' },
        { status: 400 }
      );
    }

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: id,
    });

    return NextResponse.json({
      success: true,
      message: response.data,
    });

  } catch (error) {
    console.error('获取邮件详情失败:', error);
    return NextResponse.json(
      { error: '获取邮件详情失败' },
      { status: 500 }
    );
  }
} 