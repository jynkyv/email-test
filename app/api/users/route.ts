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

    // 验证用户权限
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取所有用户
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: '获取用户列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users,
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
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
    const userId = crypto.randomUUID();

    // 在users表中添加用户信息
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
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
        id: userId,
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