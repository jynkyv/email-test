import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';

// 获取用户实时统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

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

    // 只有管理员或用户本人可以查看统计
    if (currentUserData.role !== 'admin' && currentUserId !== userId) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 计算邮件发送次数（审核通过的申请数量）
    const { count: sendCount } = await supabase
      .from('email_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('applicant_id', userId)
      .eq('status', 'approved');

    // 计算收件人数（审核通过申请的实际收件人总数）
    const { data: approvals } = await supabase
      .from('email_approvals')
      .select('recipients')
      .eq('applicant_id', userId)
      .eq('status', 'approved');

    let recipientCount = 0;
    if (approvals) {
      recipientCount = approvals.reduce((total, approval) => {
        return total + (approval.recipients ? approval.recipients.length : 0);
      }, 0);
    }

    // 获取传真发送数量
    const { data: userData } = await supabase
      .from('users')
      .select('fax_send_count')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      success: true,
      stats: {
        email_send_count: sendCount || 0,
        email_recipient_count: recipientCount,
        fax_send_count: userData?.fax_send_count || 0,
      },
    });

  } catch (error) {
    console.error('获取用户统计失败:', error);
    return NextResponse.json(
      { error: '获取用户统计失败' },
      { status: 500 }
    );
  }
} 