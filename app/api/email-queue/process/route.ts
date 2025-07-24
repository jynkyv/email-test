import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { google } from 'googleapis';

// Google OAuth2 配置
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 设置刷新token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// 创建Gmail API实例
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// 编码邮件主题（支持中文、日文等多字节字符）
function encodeSubject(subject: string): string {
  const hasNonAscii = /[^\x00-\x7F]/.test(subject);
  
  if (hasNonAscii) {
    return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
  } else {
    return subject;
  }
}

// 编码邮件内容（支持中文、日文等多字节字符）
function encodeContent(content: string): string {
  return Buffer.from(content, 'utf-8').toString('utf-8');
}

// 发送单封邮件
async function sendSingleEmail(to: string, subject: string, html: string) {
  // 生成 Message-ID
  const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${process.env.GOOGLE_EMAIL?.split('@')[1]}>`;

  // 构建邮件头信息
  const headers = [
    `From: ${process.env.GOOGLE_EMAIL}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    `Message-ID: ${messageId}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `X-Mailer: Email-Test-App`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    encodeContent(html)
  ];

  // 使用正确的邮件头信息
  const emailContent = headers.join('\r\n');

  const message = {
    raw: Buffer.from(emailContent, 'utf-8').toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  };

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: message,
  });

  return response.data;
}

// 处理邮件队列
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

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

    // 只有管理员可以处理队列
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取待处理的邮件（限制每次处理10个）
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('获取待处理邮件失败:', fetchError);
      return NextResponse.json(
        { error: '获取待处理邮件失败' },
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有待处理的邮件',
        processed: 0
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 处理每个邮件
    for (const email of pendingEmails) {
      try {
        // 更新状态为处理中
        await supabase
          .from('email_queue')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // 直接发送邮件
        try {
          const result = await sendSingleEmail(email.recipient, email.subject, email.content);
          
          // 发送成功
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);

          successCount++;
          results.push({
            id: email.id,
            recipient: email.recipient,
            success: true,
            messageId: result.id
          });
        } catch (sendError) {
          // 发送失败
          const errorMessage = sendError instanceof Error ? sendError.message : '未知错误';
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: errorMessage,
              retry_count: email.retry_count + 1,
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);

          failCount++;
          results.push({
            id: email.id,
            recipient: email.recipient,
            success: false,
            error: errorMessage
          });
        }
      } catch (error) {
        // 处理异常
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: errorMessage,
            retry_count: email.retry_count + 1,
            processed_at: new Date().toISOString()
          })
          .eq('id', email.id);

        failCount++;
        results.push({
          id: email.id,
          recipient: email.recipient,
          success: false,
          error: errorMessage
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `处理完成。成功: ${successCount}, 失败: ${failCount}`,
      processed: pendingEmails.length,
      results
    });

  } catch (error) {
    console.error('处理邮件队列失败:', error);
    return NextResponse.json(
      { error: '处理邮件队列失败' },
      { status: 500 }
    );
  }
} 