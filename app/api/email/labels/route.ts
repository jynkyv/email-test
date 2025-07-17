import { NextRequest, NextResponse } from 'next/server';
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

// 获取标签列表
export async function GET(request: NextRequest) {
  try {
    const response = await gmail.users.labels.list({
      userId: 'me'
    });

    // 过滤出用户创建的标签（排除系统标签）
    const userLabels = response.data.labels?.filter(label => {
      // 排除系统标签
      const systemLabels = [
        'INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'IMPORTANT',
        'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS',
        'CATEGORY_UPDATES', 'CATEGORY_FORUMS', 'CATEGORY_UPDATES',
        'UNREAD', 'STARRED'
      ];
      
      return label.name && !systemLabels.includes(label.id!);
    }) || [];

    return NextResponse.json({
      success: true,
      labels: userLabels.map(label => label.name)
    });

  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
} 