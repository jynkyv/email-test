import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

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
  // 检测是否包含非ASCII字符
  const hasNonAscii = /[^\x00-\x7F]/.test(subject);
  
  if (hasNonAscii) {
    // 对包含非ASCII字符的主题进行Base64编码
    return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
  } else {
    // ASCII字符直接返回
    return subject;
  }
}

// 编码邮件内容（支持中文、日文等多字节字符）
function encodeContent(content: string): string {
  // 确保内容使用UTF-8编码
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

// 发送邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, isBulk = false, customerIds = [] } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证用户权限
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

    // 确保 to 是数组
    const recipients = Array.isArray(to) ? to : [to];
    
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: '没有有效的收件人' },
        { status: 400 }
      );
    }

    // 如果是群发模式，逐个发送给每个收件人
    if (isBulk && recipients.length > 1) {
      const results = [];
      
      for (const recipient of recipients) {
        try {
          const result = await sendSingleEmail(recipient, subject, html);
          results.push({
            email: recipient,
            success: true,
            messageId: result.id
          });
        } catch (error) {
          console.error(`发送邮件给 ${recipient} 失败:`, error);
          results.push({
            email: recipient,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      // 记录邮件日志
      if (customerIds.length > 0) {
        await supabase
          .from('email_logs')
          .insert({
            to: recipients.join(', '),
            subject,
            content: html,
            sent_by: userData.id,
            customer_ids: customerIds,
          });
      }

      // 更新用户统计 - 群发时发送次数只算1次，收件人数+成功发送的数量
      if (successCount > 0) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users/update-stats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userId}`,
            },
            body: JSON.stringify({
              userId: userData.id,
              sendCount: 1, // 群发时发送次数只算1次
              recipientCount: successCount, // 实际成功发送的收件人数
            }),
          });
        } catch (statsError) {
          console.error('更新用户统计失败:', statsError);
          // 不阻止邮件发送流程，只记录错误
        }
      }

      return NextResponse.json({
        success: successCount > 0,
        message: `发送完成。成功: ${successCount}, 失败: ${failCount}`,
        results,
        totalSent: successCount,
        totalFailed: failCount
      });
    } else {
      // 单发模式
      const recipient = recipients[0];
      const result = await sendSingleEmail(recipient, subject, html);
      
      // 记录邮件日志
      if (customerIds.length > 0) {
        await supabase
          .from('email_logs')
          .insert({
            to: recipient,
            subject,
            content: html,
            sent_by: userData.id,
            customer_ids: customerIds,
          });
      }

      // 更新用户统计 - 单发模式发送次数+1，收件人数+1
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users/update-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`,
          },
          body: JSON.stringify({
            userId: userData.id,
            sendCount: 1, // 单发模式发送次数+1
            recipientCount: 1, // 单发模式收件人数+1
          }),
        });
      } catch (statsError) {
        console.error('更新用户统计失败:', statsError);
        // 不阻止邮件发送流程，只记录错误
      }
      
      return NextResponse.json({
        success: true,
        messageId: result.id,
        message: '邮件发送成功'
      });
    }

  } catch (error) {
    console.error('发送邮件失败:', error);
    
    let errorMessage = '发送邮件失败';
    const errorObj = error as any;
    
    if (errorObj.code === 'ECONNRESET') {
      errorMessage = '网络连接被重置，请检查代理设置';
    } else if (errorObj.code === 'ETIMEDOUT') {
      errorMessage = '网络连接超时，请检查网络和代理';
    } else if (errorObj.message?.includes('oauth2.googleapis.com')) {
      errorMessage = '无法连接到Google服务，请检查代理设置';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorObj.message },
      { status: 500 }
    );
  }
}

// 获取邮件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];
    
    const detailedMessages = await Promise.all(
      messages.map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
        });
        return detail.data;
      })
    );

    return NextResponse.json({
      success: true,
      messages: detailedMessages,
    });

  } catch (error) {
    console.error('获取邮件失败:', error);
    return NextResponse.json(
      { error: '获取邮件失败' },
      { status: 500 }
    );
  }
} 