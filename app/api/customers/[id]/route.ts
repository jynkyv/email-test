import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
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

    // 只有管理员可以删除客户
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以删除客户' },
        { status: 403 }
      );
    }

    // 删除客户
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (deleteError) {
      console.error('删除客户失败:', deleteError);
      return NextResponse.json(
        { error: '删除客户失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '客户删除成功'
    });

  } catch (error) {
    console.error('删除客户时发生错误:', error);
    return NextResponse.json(
      { error: '删除客户失败' },
      { status: 500 }
    );
  }
} 