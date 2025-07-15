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
      subject,
      text,
      html,
    };

    // 使用Gmail API发送邮件
    const message = {
      raw: Buffer.from(
        `To: ${mailOptions.to}\r\n` +
        `From: ${mailOptions.from}\r\n` +
        `Subject: ${mailOptions.subject}\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n` +
        `\r\n` +
        `${mailOptions.html || mailOptions.text}`
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
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