import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Service Role Key创建管理员客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 创建具有管理员权限的客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 添加CORS支持
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('📧 收到邮件退订请求');
  console.log('请求时间:', new Date().toISOString());

  try {
    // 获取请求数据
    const body = await request.json();
    const { email, company_name, reason } = body;

    // 验证必需参数
    if (!email) {
      return NextResponse.json(
        { success: false, message: '邮箱地址不能为空' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 获取客户端信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('退订信息:', { 
      email, 
      company_name, 
      reason,
      ipAddress,
      userAgent
    });

    // 检查是否已经退订
    const { data: existingUnsubscription } = await supabaseAdmin
      .from('email_unsubscriptions')
      .select('id, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUnsubscription) {
      console.log('⚠️ 该邮箱已经退订:', email);
      return NextResponse.json(
        { 
          success: true, 
          message: '该邮箱已经退订',
          alreadyUnsubscribed: true,
          unsubscribedAt: existingUnsubscription.created_at
        },
        { 
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 记录退订信息
    const { data: unsubscription, error: insertError } = await supabaseAdmin
      .from('email_unsubscriptions')
      .insert({
        email: email.toLowerCase(),
        company_name: company_name || null,
        unsubscribe_reason: reason || null,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ 记录退订失败:', insertError);
      return NextResponse.json(
        { success: false, message: '退订处理失败' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    console.log('✅ 退订记录成功:', unsubscription.id);

    return NextResponse.json({
      success: true,
      message: '退订成功',
      unsubscriptionId: unsubscription.id,
      unsubscribedAt: unsubscription.created_at
    }, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('❌ 退订处理异常:', error);
    return NextResponse.json(
      { success: false, message: '退订处理失败' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

// 获取退订列表（仅管理员可访问）
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
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
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const email = searchParams.get('email');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询
    let query = supabaseAdmin
      .from('email_unsubscriptions')
      .select('*', { count: 'exact' });

    // 添加筛选条件
    if (email) {
      query = query.ilike('email', `%${email}%`);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // 添加排序和分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: unsubscriptions, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('获取退订列表失败:', error);
      return NextResponse.json(
        { error: '获取退订列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unsubscriptions,
      total: count,
      page,
      pageSize
    });

  } catch (error) {
    console.error('获取退订列表异常:', error);
    return NextResponse.json(
      { error: '获取退订列表失败' },
      { status: 500 }
    );
  }
}