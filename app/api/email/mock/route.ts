import { NextRequest, NextResponse } from 'next/server';

// 模拟邮件发送API
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

    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟成功响应
    return NextResponse.json({
      success: true,
      messageId: `mock_${Date.now()}`,
      message: '邮件发送成功（模拟模式）',
      details: {
        to: isBulk ? to : [to],
        subject,
        content: html || text,
        isBulk
      }
    });

  } catch (error) {
    console.error('模拟发送邮件失败:', error);
    return NextResponse.json(
      { error: '模拟发送邮件失败' },
      { status: 500 }
    );
  }
}

// 模拟获取邮件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // 模拟邮件数据
    const mockEmails = [
      {
        id: 'mock_1',
        threadId: 'thread_1',
        labelIds: ['INBOX'],
        snippet: '这是一封测试邮件',
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'To', value: 'fishmooger@gmail.com' },
            { name: 'Subject', value: '测试邮件' }
          ],
          body: {
            data: Buffer.from('这是邮件内容').toString('base64')
          }
        }
      },
      {
        id: 'mock_2',
        threadId: 'thread_2',
        labelIds: ['INBOX'],
        snippet: '另一封测试邮件',
        payload: {
          headers: [
            { name: 'From', value: 'another@example.com' },
            { name: 'To', value: 'fishmooger@gmail.com' },
            { name: 'Subject', value: '第二封测试邮件' }
          ],
          body: {
            data: Buffer.from('这是第二封邮件的内容').toString('base64')
          }
        }
      }
    ];

    // 根据查询过滤邮件
    const filteredEmails = query 
      ? mockEmails.filter(email => 
          email.payload.headers.some(header => 
            header.value.toLowerCase().includes(query.toLowerCase())
          )
        )
      : mockEmails;

    return NextResponse.json({
      success: true,
      messages: filteredEmails,
    });

  } catch (error) {
    console.error('模拟获取邮件失败:', error);
    return NextResponse.json(
      { error: '模拟获取邮件失败' },
      { status: 500 }
    );
  }
} 