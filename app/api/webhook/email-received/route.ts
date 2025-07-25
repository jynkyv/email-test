import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  console.log('📧 收到SendGrid Inbound Parse webhook请求');
  console.log('请求时间:', new Date().toISOString());
  console.log('请求头:', Object.fromEntries(request.headers.entries()));

  try {
    // 获取原始数据
    const formData = await request.formData();
    
    // 记录所有接收到的字段
    const allFields: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      allFields[key] = typeof value === 'string' ? value.substring(0, 200) : value;
    }
    console.log('接收到的所有字段:', allFields);
    
    // 解析邮件信息
    const from = formData.get('from') as string;
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const text = formData.get('text') as string;
    const html = formData.get('html') as string;
    const messageId = formData.get('message-id') as string;
    
    console.log('解析的邮件信息:', { 
      from, 
      to, 
      subject: subject?.substring(0, 50), 
      messageId,
      hasText: !!text,
      hasHtml: !!html,
      textLength: text?.length,
      htmlLength: html?.length
    });

    if (!to) {
      console.log('❌ 缺少收件人信息');
      return NextResponse.json(
        { success: false, message: '缺少收件人信息' },
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

    // 查找对应的客户
    console.log('🔍 查找客户:', to);
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, company_name, email')
      .eq('email', to)
      .single();

    // 如果客户不存在，自动创建
    if (!customer && customerError?.code === 'PGRST116') {
      console.log('⚠️ 客户不存在，自动创建客户记录');
      
      // 从发件人信息中提取公司名称
      let companyName = '未知公司';
      if (from) {
        // 尝试从发件人信息中提取公司名称
        const fromMatch = from.match(/<(.+?)>/);
        if (fromMatch) {
          const email = fromMatch[1];
          const domain = email.split('@')[1];
          companyName = domain ? domain.split('.')[0] : '未知公司';
        } else {
          // 如果没有尖括号，直接使用发件人信息
          companyName = from.split('@')[0] || '未知公司';
        }
      }
      
      // 创建新客户记录
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          company_name: companyName,
          email: to,
          created_by: 'system' // 系统自动创建
        })
        .select('id, company_name, email')
        .single();

      if (createError) {
        console.error('❌ 创建客户失败:', createError);
        return NextResponse.json(
          { success: false, message: '创建客户失败' },
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

      customer = newCustomer;
      console.log('✅ 客户创建成功:', { id: customer.id, company: customer.company_name, email: customer.email });
    } else if (customerError) {
      console.log('❌ 查询客户失败:', customerError);
      return NextResponse.json(
        { success: false, message: '查询客户失败' },
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

    if (!customer) {
      console.log('❌ 未找到对应客户且创建失败:', to);
      return NextResponse.json(
        { success: false, message: '客户不存在且创建失败' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    console.log('✅ 找到客户:', { id: customer.id, company: customer.company_name, email: customer.email });

    // 检查是否已存在相同message-id的邮件
    if (messageId) {
      const { data: existingEmail } = await supabase
        .from('customer_emails')
        .select('id')
        .eq('message_id', messageId)
        .single();

      if (existingEmail) {
        console.log('⚠️ 邮件已存在，跳过处理:', messageId);
        return NextResponse.json(
          { success: true, message: '邮件已存在' },
          { 
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            }
          }
        );
      }
    }

    // 插入邮件记录
    console.log('💾 插入邮件记录...');
    const { data: email, error: emailError } = await supabase
      .from('customer_emails')
      .insert({
        customer_id: customer.id,
        from_email: from || 'unknown@example.com',
        to_email: to,
        subject: subject || '无主题',
        content: html || text || '',
        message_id: messageId,
        is_read: false
      })
      .select()
      .single();

    if (emailError) {
      console.error('❌ 插入邮件失败:', emailError);
      return NextResponse.json(
        { success: false, message: '插入邮件失败' },
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

    console.log('✅ 邮件记录插入成功:', email.id);

    // 更新客户状态
    console.log('🎉 邮件处理完成:', {
      emailId: email.id,
      customerId: customer.id,
      from,
      to,
      subject: subject?.substring(0, 30)
    });

    return NextResponse.json(
      { 
        success: true, 
        emailId: email.id,
        customerId: customer.id,
        message: '邮件处理成功'
      },
      { 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );

  } catch (error) {
    console.error('❌ 处理邮件webhook失败:', error);
    const errorObj = error as Error;
    console.error('错误详情:', {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name
    });
    
    return NextResponse.json(
      { success: false, message: '处理失败', error: errorObj.message },
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

// 添加GET方法用于测试
export async function GET(request: NextRequest) {
  console.log('�� Webhook接口测试访问');
  return NextResponse.json(
    { 
      success: true, 
      message: 'Webhook接口可访问',
      timestamp: new Date().toISOString()
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