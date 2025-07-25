import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 添加邮件到队列
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvalId } = body;
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

    // 只有管理员可以添加邮件到队列
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取审核申请详情
    const { data: approval, error: approvalError } = await supabase
      .from('email_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (approvalError || !approval) {
      return NextResponse.json(
        { error: '审核申请不存在' },
        { status: 404 }
      );
    }

    // 检查状态
    if (approval.status !== 'pending') {
      return NextResponse.json(
        { error: '该申请已被处理' },
        { status: 400 }
      );
    }

    // 将邮件添加到队列
    const queueItems = approval.recipients.map((recipient: string) => ({
      approval_id: approvalId,
      recipient,
      subject: approval.subject,
      content: approval.content,
      status: 'pending'
    }));

    const { data: queueData, error: queueError } = await supabase
      .from('email_queue')
      .insert(queueItems)
      .select();

    if (queueError) {
      console.error('添加邮件到队列失败:', queueError);
      return NextResponse.json(
        { error: '添加邮件到队列失败' },
        { status: 500 }
      );
    }

    // 更新审核申请状态为处理中
    const { error: updateError } = await supabase
      .from('email_approvals')
      .update({
        status: 'approved',
        approver_id: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', approvalId);

    if (updateError) {
      console.error('更新审核申请状态失败:', updateError);
      return NextResponse.json(
        { error: '更新审核申请状态失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '邮件已添加到发送队列',
      queueCount: queueItems.length
    });

  } catch (error) {
    console.error('添加邮件到队列失败:', error);
    return NextResponse.json(
      { error: '添加邮件到队列失败' },
      { status: 500 }
    );
  }
}

// 查询队列状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approvalId = searchParams.get('approvalId');
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

    if (!approvalId) {
      return NextResponse.json(
        { error: '缺少审核申请ID' },
        { status: 400 }
      );
    }

    // 获取队列状态
    const { data: queueItems, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('approval_id', approvalId)
      .order('created_at', { ascending: true });

    if (queueError) {
      console.error('查询队列状态失败:', queueError);
      return NextResponse.json(
        { error: '查询队列状态失败' },
        { status: 500 }
      );
    }

    // 计算统计信息
    const total = queueItems.length;
    const pending = queueItems.filter(item => item.status === 'pending').length;
    const processing = queueItems.filter(item => item.status === 'processing').length;
    const sent = queueItems.filter(item => item.status === 'sent').length;
    const failed = queueItems.filter(item => item.status === 'failed').length;
    const completed = sent + failed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      queue: queueItems,
      stats: {
        total,
        pending,
        processing,
        sent,
        failed,
        completed,
        progress
      }
    });

  } catch (error) {
    console.error('查询队列状态失败:', error);
    return NextResponse.json(
      { error: '查询队列状态失败' },
      { status: 500 }
    );
  }
} 