import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取客户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortByUnread = searchParams.get('sortByUnread') === 'true'; // 新增参数控制排序方式
    const searchField = searchParams.get('searchField') || 'company_name'; // 搜索字段
    const searchValue = searchParams.get('searchValue') || ''; // 搜索值
    const hasEmailOnly = searchParams.get('hasEmailOnly') === 'true'; // 新增参数：只返回有邮箱的客户
    const hasFaxOnly = searchParams.get('hasFaxOnly') === 'true'; // 新增参数：只返回有传真的客户
    const authHeader = request.headers.get('authorization');
    
    console.log('客户列表请求参数:', { page, pageSize, startDate, endDate, sortByUnread, searchField, searchValue, hasEmailOnly, hasFaxOnly });
    
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

    // 构建基础查询 - 包含未读邮件状态
    let query = supabase
      .from('customers')
      .select(`
        *,
        customer_emails!left(
          id,
          is_read
        )
      `, { count: 'exact' });

    // 如果不是管理员，只能查看自己创建的客户
    if (userData.role !== 'admin') {
      query = query.eq('created_by', userId);
    }

    // 如果只返回有邮箱的客户，添加邮箱过滤条件
    if (hasEmailOnly) {
      query = query.not('email', 'is', null).neq('email', '');
    }

    // 如果只返回有传真的客户，添加传真过滤条件
    if (hasFaxOnly) {
      // 选项A：显示有传真的客户（不管是否有邮箱）
      query = query.not('fax', 'is', null).neq('fax', '');
      
      // 选项B：显示只有传真但没有邮箱的客户
      // query = query.not('fax', 'is', null).neq('fax', '').or('email.is.null,email.eq.');
    }

    // 添加时间筛选
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDateTime.toISOString());
    }

    // 添加搜索筛选
    if (searchValue && searchValue.trim()) {
      const searchTerm = searchValue.trim();
      
      switch (searchField) {
        case 'company_name':
          query = query.ilike('company_name', `%${searchTerm}%`);
          break;
        case 'email':
          query = query.ilike('email', `%${searchTerm}%`);
          break;
        case 'fax':
          query = query.ilike('fax', `%${searchTerm}%`);
          break;
        case 'address':
          query = query.ilike('address', `%${searchTerm}%`);
          break;
        default:
          // 默认搜索公司名称
          query = query.ilike('company_name', `%${searchTerm}%`);
      }
    }

    // 先获取总数
    const { count: totalCount, error: countError } = await query;
    
    if (countError) {
      console.error('获取总数失败:', countError);
      return NextResponse.json(
        { error: '获取客户列表失败' },
        { status: 500 }
      );
    }

    // 应用排序和分页
    let sortedQuery = query;

    if (sortByUnread) {
      // 邮件管理页面：按创建时间倒序，然后在内存中处理未读邮件排序
      sortedQuery = sortedQuery.order('created_at', { ascending: false });
    } else {
      // 其他页面：按创建时间倒序，添加ID作为第二排序字段确保稳定性
      sortedQuery = sortedQuery.order('created_at', { ascending: false })
                              .order('id', { ascending: false });
    }

    // 应用分页
    const { data: customersWithEmails, error } = await sortedQuery
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('数据库查询错误:', error);
      return NextResponse.json(
        { error: '获取客户列表失败' },
        { status: 500 }
      );
    }

    // 处理客户数据，计算未读邮件状态
    const processedCustomers = customersWithEmails?.map(customer => {
      const hasUnreadEmails = customer.customer_emails?.some((email: any) => !email.is_read) || false;
      return {
        ...customer,
        has_unread_emails: hasUnreadEmails,
        customer_emails: undefined // 移除邮件数据，只保留客户信息
      };
    }) || [];

    // 如果是邮件管理页面，需要重新排序（有未读邮件的排在前面）
    let finalCustomers = processedCustomers;
    if (sortByUnread) {
      finalCustomers = processedCustomers.sort((a, b) => {
        // 首先按未读邮件状态排序（有未读邮件的排在前面）
        if (a.has_unread_emails && !b.has_unread_emails) {
          return -1;
        }
        if (!a.has_unread_emails && b.has_unread_emails) {
          return 1;
        }
        // 如果未读邮件状态相同，按创建时间倒序
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    console.log('客户列表查询结果:', { 
      customersCount: finalCustomers?.length, 
      totalCount: totalCount, 
      page, 
      pageSize,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      customers: finalCustomers,
      total: totalCount || 0,
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
    
    const { company_name, email, fax: rawFax, address } = body;

    // 处理fax列：保留数组和-符号，删除其他前缀
    let fax = rawFax;
    if (fax) {
      // 移除常见的前缀，但保留数组和-符号
      fax = fax
        .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ|fax\s*number|FAX\s*NUMBER|Fax\s*Number|传真号码|ＦＡＸ番号)\s*[:：]\s*/gi, '') // 移除前缀
        .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ)\s+/gi, '') // 移除前缀加空格
        .replace(/^[+＋]\s*/, '') // 移除加号前缀
        .replace(/^[0０]\s*/, '') // 移除0前缀
        .replace(/^[8８][1１][-－]\s*/, '') // 移除81-前缀
        .replace(/^[8８][1１]\s*/, '') // 移除81前缀
        .trim();
    }

    if (!company_name) {
      console.log('参数验证失败: 企业名称为空');
      return NextResponse.json(
        { error: '企业名称不能为空' },
        { status: 400 }
      );
    }

    if (!email && !fax) {
      console.log('参数验证失败: email和fax都为空');
      return NextResponse.json(
        { error: '邮箱和传真至少需要填写一个' },
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

    // 检查邮箱是否已存在（只在有邮箱时检查）
    if (email) {
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
    }

    // 创建新客户
    console.log('开始插入客户数据:', {
      company_name,
      email,
      fax,
      address,
      created_by: userId,
    });
    
    const { data, error } = await supabase
      .from('customers')
      .insert({
        company_name,
        email,
        fax: fax || null,
        address: address || null,
        fax_status: fax ? 'inactive' : null, // 如果有传真号码，默认设置为未发送状态
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