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

    if (!from) {
      console.log('❌ 缺少发件人信息');
      return NextResponse.json(
        { success: false, message: '缺少发件人信息' },
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

    // 从发件人信息中提取邮箱
    let fromEmail = '';
    if (from.includes('<') && from.includes('>')) {
      // 格式: "Name <email@domain.com>"
      const match = from.match(/<(.+?)>/);
      fromEmail = match ? match[1] : from;
    } else {
      // 格式: "email@domain.com"
      fromEmail = from;
    }

    console.log('🔍 查找发件人客户:', fromEmail);

    // 查找对应的客户（根据发件人邮箱）
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, company_name, email')
      .eq('email', fromEmail)
      .single();

    // 如果客户不存在，直接丢弃邮件
    if (!customer && customerError?.code === 'PGRST116') {
      console.log('❌ 发件人不是客户，丢弃邮件:', fromEmail);
      return NextResponse.json(
        { success: true, message: '发件人不是客户，邮件已丢弃' },
        { 
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
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
      console.log('❌ 未找到对应客户:', fromEmail);
      return NextResponse.json(
        { success: true, message: '发件人不是客户，邮件已丢弃' },
        { 
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
      const { data: existingEmail } = await supabaseAdmin
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
    console.log('💾 插入邮件记录到客户:', customer.id);
    const { data: email, error: emailError } = await supabaseAdmin
      .from('customer_emails')
      .insert({
        customer_id: customer.id,
        from_email: fromEmail,
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

    // 更新客户未读状态
    console.log('🎉 更新客户未读状态...');
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({ has_unread_emails: true })
      .eq('id', customer.id);

    if (updateError) {
      console.error('⚠️ 更新客户状态失败:', updateError);
    } else {
      console.log('✅ 客户状态更新成功');
    }

    console.log('🎉 邮件处理完成:', {
      emailId: email.id,
      customerId: customer.id,
      from: fromEmail,
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
  console.log(' Webhook接口测试访问');
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