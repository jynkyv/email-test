import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

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

// 发送邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html, isBulk = false } = body;

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建邮件内容
    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: isBulk ? to.join(',') : to,
      subject: encodeSubject(subject), // 编码主题
      text: text ? encodeContent(text) : undefined,
      html: html ? encodeContent(html) : undefined,
    };

    // 生成 Message-ID
    const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${process.env.GOOGLE_EMAIL?.split('@')[1]}>`;

    // 构建邮件头信息
    const headers = [
      `From: ${mailOptions.from}`,
      `To: ${mailOptions.to}`,
      `Subject: ${mailOptions.subject}`,
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `X-Mailer: Email-Test-App`,
    ];

    // 根据内容类型设置Content-Type
    if (mailOptions.html) {
      headers.push(`Content-Type: text/html; charset=UTF-8`);
      headers.push(`Content-Transfer-Encoding: 8bit`);
      headers.push(``);
      headers.push(mailOptions.html);
    } else if (mailOptions.text) {
      headers.push(`Content-Type: text/plain; charset=UTF-8`);
      headers.push(`Content-Transfer-Encoding: 8bit`);
      headers.push(``);
      headers.push(mailOptions.text);
    }

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

    return NextResponse.json({
      success: true,
      messageId: response.data.id,
      message: '邮件发送成功'
    });

  } catch (error) {
    console.error('发送邮件失败:', error);
    
    // 更详细的错误信息
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
    
    // 获取邮件详情
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