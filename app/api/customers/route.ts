import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
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

    // 计算偏移量
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // 如果不是管理员，只能查看自己创建的客户
    if (userData.role !== 'admin') {
      query = query.eq('created_by', userId);
    }

    const { data: customers, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: '获取客户列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers,
      total: count || 0,
      page,
      pageSize,
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
    console.log('开始创建客户...');
    const body = await request.json();
    console.log('请求体:', body);
    
    const { company_name, email } = body;

    if (!company_name || !email) {
      console.log('参数验证失败:', { company_name, email });
      return NextResponse.json(
        { error: '企业名称和邮箱不能为空' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    console.log('认证头:', authHeader);
    
    if (!authHeader) {
      console.log('缺少认证头');
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从 authorization header 中获取用户 ID
    const userId = authHeader.replace('Bearer ', '');
    console.log('用户ID:', userId);
    
    // 获取用户信息
    console.log('查询用户信息...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('用户查询结果:', { userData, userError });

    if (userError || !userData) {
      console.log('用户不存在或查询失败:', userError);
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 检查邮箱是否已存在
    console.log('检查邮箱是否已存在:', email);
    const { data: existingCustomer, error: existingError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email);

    console.log('邮箱检查结果:', { existingCustomer, existingError });

    if (existingCustomer && existingCustomer.length > 0) {
      console.log('邮箱已存在');
      return NextResponse.json(
        { error: '该邮箱已存在' },
        { status: 400 }
      );
    }

    // 创建新客户
    console.log('开始插入客户数据:', {
      company_name,
      email,
      created_by: userId,
    });
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        company_name,
        email,
        created_by: userId,
      })
      .select()
      .single();

    console.log('插入结果:', { data, error });

    if (error) {
      console.error('创建客户失败:', error);
      return NextResponse.json(
        { error: '创建客户失败', details: error.message },
        { status: 500 }
      );
    }

    console.log('客户创建成功:', data);
    return NextResponse.json({
      success: true,
      message: '客户创建成功',
      customer: data,
    });

  } catch (error) {
    console.error('创建客户时发生异常:', error);
    return NextResponse.json(
      { error: '创建客户失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
} 