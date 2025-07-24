import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取审核详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
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

    // 获取审核详情
    const { data: approval, error } = await supabase
      .from('email_approvals')
      .select(`
        *,
        applicant:users!email_approvals_applicant_id_fkey(username, role),
        approver:users!email_approvals_approver_id_fkey(username)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: '审核申请不存在' },
        { status: 404 }
      );
    }

    // 权限检查：非管理员只能查看自己的申请
    if (userData.role !== 'admin' && approval.applicant_id !== userId) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      approval
    });

  } catch (error) {
    console.error('获取审核详情失败:', error);
    return NextResponse.json(
      { error: '获取审核详情失败' },
      { status: 500 }
    );
  }
}

// 更新审核状态或内容
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, subject, content } = body;
    const authHeader = request.headers.get('authorization');
    
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

    // 只有管理员可以更新审核状态和内容
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取当前审核申请
    const { data: currentApproval, error: fetchError } = await supabase
      .from('email_approvals')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentApproval) {
      return NextResponse.json(
        { error: '审核申请不存在' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    if (action === 'approve') {
      // 审核通过，只更新状态（邮件发送由专门的API处理）
      updateData = {
        status: 'approved',
        approver_id: userId,
        approved_at: new Date().toISOString()
      };

    } else if (action === 'reject') {
      // 审核拒绝
      updateData = {
        status: 'rejected',
        approver_id: userId,
        approved_at: new Date().toISOString()
      };

    } else if (action === 'update') {
      // 更新内容
      if (!subject || !content) {
        return NextResponse.json(
          { error: '邮件主题和内容不能为空' },
          { status: 400 }
        );
      }
      updateData = {
        subject,
        content
      };
    }

    // 更新审核申请
    const { data: updatedApproval, error: updateError } = await supabase
      .from('email_approvals')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('更新审核申请失败:', updateError);
      return NextResponse.json(
        { error: '更新审核申请失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approval: updatedApproval,
      message: action === 'approve' ? '审核已通过' : 
               action === 'reject' ? '审核已拒绝' : '内容已更新'
    });

  } catch (error) {
    console.error('更新审核申请失败:', error);
    return NextResponse.json(
      { error: '更新审核申请失败' },
      { status: 500 }
    );
  }
} 