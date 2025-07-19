import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    // 如果不是管理员，只能查看自己创建的客户
    if (userData.role !== 'admin') {
      query = query.eq('created_by', userId);
    }

    const { data: customers, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: '获取客户列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers,
    });

  } catch (error) {
    console.error('获取客户列表失败:', error);
    return NextResponse.json(
      { error: '获取客户列表失败' },
      { status: 500 }
    );
  }
}

// 创建新客户
export async function POST(request: NextRequest) {
  try {
    const { company_name, email } = await request.json();

    if (!company_name || !email) {
      return NextResponse.json(
        { error: '企业名称和邮箱不能为空' },
        { status: 400 }
      );
    }

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

    // 检查邮箱是否已存在
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: '该邮箱已存在' },
        { status: 400 }
      );
    }

    // 创建新客户
    const { data, error } = await supabase
      .from('customers')
      .insert({
        company_name,
        email,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '创建客户失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '客户创建成功',
      customer: data,
    });

  } catch (error) {
    console.error('创建客户失败:', error);
    return NextResponse.json(
      { error: '创建客户失败' },
      { status: 500 }
    );
  }
} 