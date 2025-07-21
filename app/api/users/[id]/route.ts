import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const currentUserId = authHeader.replace('Bearer ', '');

    // 检查当前用户权限
    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUserId)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 只有管理员可以删除员工
    if (currentUserData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以删除员工' },
        { status: 403 }
      );
    }

    // 防止删除自己
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: '不能删除自己的账户' },
        { status: 400 }
      );
    }

    // 检查要删除的用户是否存在
    const { data: targetUserData, error: targetUserError } = await supabase
      .from('users')
      .select('username, role')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUserData) {
      return NextResponse.json(
        { error: '要删除的用户不存在' },
        { status: 404 }
      );
    }

    // 删除用户
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('删除员工失败:', deleteError);
      return NextResponse.json(
        { error: '删除员工失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `员工 ${targetUserData.username} 删除成功`
    });

  } catch (error) {
    console.error('删除员工时发生错误:', error);
    return NextResponse.json(
      { error: '删除员工失败' },
      { status: 500 }
    );
  }
} 