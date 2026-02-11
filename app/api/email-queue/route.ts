import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
    const { data: userData, error: userError } = await supabaseAdmin
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
    const { data: approval, error: approvalError } = await supabaseAdmin
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

    // 使用事务确保队列添加和状态更新的原子性
    const { data: queueData, error: queueError } = await supabaseAdmin.rpc('add_emails_to_queue_and_update_approval', {
      p_approval_id: approvalId,
      p_approver_id: userId,
      p_recipients: approval.recipients,
      p_subject: approval.subject,
      p_content: approval.content
    });

    if (queueError) {
      console.error('添加邮件到队列失败:', queueError);
      return NextResponse.json(
        {
          error: '添加邮件到队列失败',
          details: queueError.message,
          code: queueError.code,
          hint: queueError.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '邮件已添加到发送队列',
      queueCount: approval.recipients.length
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
    const { data: userData, error: userError } = await supabaseAdmin
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
    const { data: queueItems, error: queueError } = await supabaseAdmin
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