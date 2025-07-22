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

// 更新邮件状态（已读/未读）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'read' 或 'unread'

    if (!id) {
      return NextResponse.json(
        { error: '邮件ID不能为空' },
        { status: 400 }
      );
    }

    if (!action || !['read', 'unread'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      );
    }

    // 根据操作类型设置标签
    const addLabelIds = action === 'unread' ? ['UNREAD'] : [];
    const removeLabelIds = action === 'read' ? ['UNREAD'] : [];

    // 更新邮件状态
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id: id,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });

    return NextResponse.json({
      success: true,
      message: action === 'read' ? '邮件已标记为已读' : '邮件已标记为未读',
      data: response.data,
    });

  } catch (error) {
    console.error('更新邮件状态失败:', error);
    return NextResponse.json(
      { error: '更新邮件状态失败' },
      { status: 500 }
    );
  }
}

// 获取单个邮件详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '邮件ID不能为空' },
        { status: 400 }
      );
    }

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: id,
    });

    return NextResponse.json({
      success: true,
      message: response.data,
    });

  } catch (error) {
    console.error('获取邮件详情失败:', error);
    return NextResponse.json(
      { error: '获取邮件详情失败' },
      { status: 500 }
    );
  }
} 