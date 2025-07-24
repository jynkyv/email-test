import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取审核列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const applicantName = searchParams.get('applicantName') || '';
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

    // 如果有申请人名称筛选，先查询匹配的用户ID
    let applicantIds: string[] = [];
    if (applicantName.trim()) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .ilike('username', `%${applicantName.trim()}%`);
      
      if (usersError) {
        console.error('用户查询错误:', usersError);
        return NextResponse.json(
          { error: '筛选用户失败' },
          { status: 500 }
        );
      }
      
      applicantIds = users.map(user => user.id);
      
      // 如果没有找到匹配的用户，直接返回空结果
      if (applicantIds.length === 0) {
        return NextResponse.json({
          success: true,
          approvals: [],
          total: 0,
          page,
          pageSize,
        });
      }
    }

    let query = supabase
      .from('email_approvals')
      .select(`
        *,
        applicant:users!email_approvals_applicant_id_fkey(username, role),
        approver:users!email_approvals_approver_id_fkey(username)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // 如果不是管理员，只能查看自己提交的申请
    if (userData.role !== 'admin') {
      query = query.eq('applicant_id', userId);
    }

    // 添加申请人名称筛选
    if (applicantIds.length > 0) {
      query = query.in('applicant_id', applicantIds);
    }

    // 应用分页
    query = query.range(from, to);

    const { data: approvals, error, count } = await query;

    if (error) {
      console.error('数据库查询错误:', error);
      return NextResponse.json(
        { error: '获取审核列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approvals,
      total: count || 0,
      page,
      pageSize,
    });

  } catch (error) {
    console.error('获取审核列表失败:', error);
    return NextResponse.json(
      { error: '获取审核列表失败' },
      { status: 500 }
    );
  }
}

// 创建审核申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, content, recipients } = body;
    const authHeader = request.headers.get('authorization');
    
    console.log('审核申请请求数据:', { subject, content: content?.substring(0, 50), recipients_count: recipients?.length });
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从 authorization header 中获取用户 ID
    const userId = authHeader.replace('Bearer ', '');
    console.log('用户ID:', userId);
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('用户查询错误:', userError);
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    console.log('用户信息:', { id: userData.id, username: userData.username, role: userData.role });

    // 验证必填字段
    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: '邮件主题、内容和收件人不能为空' },
        { status: 400 }
      );
    }

    console.log('准备插入数据:', {
      applicant_id: userId,
      subject,
      content: content.substring(0, 50) + '...',
      recipients_count: recipients.length,
      status: 'pending'
    });

    // 创建审核申请
    const { data: approval, error } = await supabase
      .from('email_approvals')
      .insert({
        applicant_id: userId,
        subject,
        content,
        recipients: recipients,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('创建审核申请失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: '创建审核申请失败', details: error.message },
        { status: 500 }
      );
    }

    console.log('审核申请创建成功:', approval);

    return NextResponse.json({
      success: true,
      approval,
      message: '审核申请提交成功'
    });

  } catch (error) {
    console.error('创建审核申请失败:', error);
    return NextResponse.json(
      { error: '创建审核申请失败' },
      { status: 500 }
    );
  }
} 