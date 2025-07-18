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
async function sendSingleEmail(to: string, subject: string, html: string, customLabel?: string) {
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

  // 如果提供了自定义标签，为邮件添加标签
  if (customLabel && customLabel.trim()) {
    try {
      // 创建标签（如果不存在）
      await createLabelIfNotExists(customLabel.trim());
      
      // 为发送的邮件添加标签
      await gmail.users.messages.modify({
        userId: 'me',
        id: response.data.id!,
        requestBody: {
          addLabelIds: [customLabel.trim()]
        }
      });
    } catch (error) {
      console.error('添加标签失败:', error);
      // 标签操作失败不影响邮件发送
    }
  }

  return response.data;
}

// 创建标签（如果不存在）
async function createLabelIfNotExists(labelName: string) {
  try {
    // 首先检查标签是否已存在
    const labelsResponse = await gmail.users.labels.list({
      userId: 'me'
    });
    
    const existingLabel = labelsResponse.data.labels?.find(
      label => label.name === labelName
    );
    
    if (!existingLabel) {
      // 创建新标签
      await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          messageListVisibility: 'show',
          labelListVisibility: 'labelShow'
        }
      });
    }
  } catch (error) {
    console.error('创建标签失败:', error);
    throw error;
  }
}

// 发送邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, customLabel, isBulk = false, customerIds = [] } = body;

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问' },
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
          const result = await sendSingleEmail(recipient, subject, html, customLabel);
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
            sent_by: user.id,
            customer_ids: customerIds,
          });
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
      const result = await sendSingleEmail(recipient, subject, html, customLabel);
      
      // 记录邮件日志
      if (customerIds.length > 0) {
        await supabase
          .from('email_logs')
          .insert({
            to: recipient,
            subject,
            content: html,
            sent_by: user.id,
            customer_ids: customerIds,
          });
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
    const labelFilter = searchParams.get('label') || '';
    const customerFilter = searchParams.get('customer') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    let searchQuery = query;
    
    if (labelFilter) {
      searchQuery = searchQuery ? `${searchQuery} label:${labelFilter}` : `label:${labelFilter}`;
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
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