import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
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
        role: 'admin',
      });

    if (insertError) {
      return NextResponse.json(
        { error: `添加用户信息失败: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '管理员用户创建成功',
      user: {
        id: userId,
        username,
        role: 'admin',
      },
    });

  } catch (error) {
    console.error('创建管理员用户失败:', error);
    return NextResponse.json(
      { error: '创建管理员用户失败' },
      { status: 500 }
    );
  }
} 