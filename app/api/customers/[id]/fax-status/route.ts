import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');
    const body = await request.json();
    const { status } = body;

    if (!status || status !== 'active') {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      );
    }

    // 检查用户权限
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, fax_send_count')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 管理员和员工都可以修改传真状态
    if (userData.role !== 'admin' && userData.role !== 'employee') {
      return NextResponse.json(
        { error: '权限不足，只有管理员和员工可以修改传真状态' },
        { status: 403 }
      );
    }

    // 检查客户是否存在且有传真号码
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('fax, fax_status')
      .eq('id', customerId)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: '客户不存在' },
        { status: 404 }
      );
    }

    if (!customerData.fax) {
      return NextResponse.json(
        { error: '该客户没有传真号码，无法修改传真状态' },
        { status: 400 }
      );
    }

    // 检查是否已经发送过
    if (customerData.fax_status === 'active') {
      return NextResponse.json(
        { error: '传真已经发送过，无法重复发送' },
        { status: 400 }
      );
    }

    // 开始事务：更新客户传真状态
    const { error: customerUpdateError } = await supabase
      .from('customers')
      .update({
        fax_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);

    if (customerUpdateError) {
      console.error('更新客户传真状态失败:', customerUpdateError);
      return NextResponse.json(
        { error: '更新传真状态失败' },
        { status: 500 }
      );
    }

    // 更新用户传真发送统计
    const currentFaxCount = userData.fax_send_count || 0;
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        fax_send_count: currentFaxCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('更新用户统计失败:', userUpdateError);
      // 注意：这里不返回错误，因为客户状态已经更新成功
      console.warn('客户传真状态已更新，但用户统计更新失败');
    }

    return NextResponse.json({
      success: true,
      message: '传真发送成功',
      status
    });

  } catch (error) {
    console.error('更新传真状态时发生错误:', error);
    return NextResponse.json(
      { error: '更新传真状态失败' },
      { status: 500 }
    );
  }
} 