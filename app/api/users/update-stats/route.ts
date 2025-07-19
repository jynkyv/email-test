import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 更新用户邮件发送统计
export async function POST(request: NextRequest) {
  try {
    const { userId, sendCount = 1, recipientCount = 0 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
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

    // 从 authorization header 中获取当前用户 ID
    const currentUserId = authHeader.replace('Bearer ', '');
    
    // 获取当前用户信息
    const { data: currentUserData, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (currentUserError || !currentUserData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 只有管理员或用户本人可以更新统计
    if (currentUserData.role !== 'admin' && currentUserId !== userId) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 先获取当前用户的统计数据
    const { data: currentStats, error: statsError } = await supabase
      .from('users')
      .select('email_send_count, email_recipient_count')
      .eq('id', userId)
      .single();

    if (statsError) {
      console.error('获取用户统计失败:', statsError);
      return NextResponse.json(
        { error: '获取用户统计失败' },
        { status: 500 }
      );
    }

    // 计算新的统计值
    const newSendCount = (currentStats?.email_send_count || 0) + sendCount;
    const newRecipientCount = (currentStats?.email_recipient_count || 0) + recipientCount;

    // 更新用户统计
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email_send_count: newSendCount,
        email_recipient_count: newRecipientCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('更新用户统计失败:', updateError);
      return NextResponse.json(
        { error: '更新用户统计失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '用户统计更新成功',
      user: updatedUser,
    });

  } catch (error) {
    console.error('更新用户统计失败:', error);
    return NextResponse.json(
      { error: '更新用户统计失败' },
      { status: 500 }
    );
  }
} 