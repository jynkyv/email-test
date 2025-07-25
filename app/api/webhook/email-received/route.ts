import { NextRequest, NextResponse } from 'next/server';

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

    // 简化的响应 - 不依赖数据库
    return NextResponse.json(
      { 
        success: true, 
        message: '邮件接收成功',
        data: {
          from,
          to,
          subject,
          messageId,
          receivedAt: new Date().toISOString()
        }
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
  console.log('🧪 Webhook接口测试访问');
  return NextResponse.json(
    { 
      success: true, 
      message: 'Webhook接口可访问',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL
      }
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