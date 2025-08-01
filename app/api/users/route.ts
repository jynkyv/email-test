import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取所有用户（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从 authorization header 中获取用户 ID
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

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取所有用户基本信息
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, created_at, fax_send_count')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: '获取用户列表失败' },
        { status: 500 }
      );
    }

    // 为每个用户计算实时统计数据
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // 计算邮件发送次数（审核通过的申请数量）
        const { count: sendCount } = await supabase
          .from('email_approvals')
          .select('*', { count: 'exact', head: true })
          .eq('applicant_id', user.id)
          .eq('status', 'approved');

        // 计算收件人数（审核通过申请的实际收件人总数）
        const { data: approvals } = await supabase
          .from('email_approvals')
          .select('recipients')
          .eq('applicant_id', user.id)
          .eq('status', 'approved');

        let recipientCount = 0;
        if (approvals) {
          recipientCount = approvals.reduce((total, approval) => {
            return total + (approval.recipients ? approval.recipients.length : 0);
          }, 0);
        }

        return {
          ...user,
          email_send_count: sendCount || 0,
          email_recipient_count: recipientCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithStats,
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// 创建新用户（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const { username, password, role = 'employee' } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从 authorization header 中获取用户 ID
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

    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 生成用户ID
    const newUserId = crypto.randomUUID();

    // 在users表中添加用户信息
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        username,
        role,
      });

    if (insertError) {
      return NextResponse.json(
        { error: '创建用户信息失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: {
        id: newUserId,
        username,
        role,
      },
    });

  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
} 