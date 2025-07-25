import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取客户邮件列表
export async function GET(
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

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    }

    // 检查权限：管理员可以查看所有，普通用户只能查看自己的客户
    let query = supabase
      .from('customer_emails')
      .select(`
        *,
        customers!inner(
          id,
          company_name,
          email,
          created_by
        )
      `)
      .eq('customer_id', customerId)
      .order('received_at', { ascending: false });

    if (user.role !== 'admin') {
      query = query.eq('customers.created_by', userId);
    }

    const { data: emails, error } = await query;

    if (error) {
      console.error('获取邮件失败:', error);
      return NextResponse.json({ error: '获取邮件失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emails });

  } catch (error) {
    console.error('获取客户邮件失败:', error);
    return NextResponse.json({ error: '获取邮件失败' }, { status: 500 });
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
      console.error('检查未读邮件失败:', countError);
    } else {
      // 更新客户状态
      await supabase
        .from('customers')
        .update({ has_unread_emails: unreadCount.length > 0 })
        .eq('id', customerId);
    }

    return NextResponse.json({ success: true, message: '标记成功' });

  } catch (error) {
    console.error('标记邮件失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
} 