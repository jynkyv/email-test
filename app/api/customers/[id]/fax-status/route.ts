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
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 只有管理员可以修改传真状态
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以修改传真状态' },
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

    // 使用事务来确保数据一致性
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_fax_status_and_user_count', {
        p_customer_id: customerId,
        p_user_id: userId,
        p_status: status
      });

    if (updateError) {
      console.error('更新传真状态失败:', updateError);
      return NextResponse.json(
        { error: '更新传真状态失败' },
        { status: 500 }
      );
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