import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: `授权失败: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: '缺少授权码' },
        { status: 400 }
      );
    }

    // 返回授权码，方便用户复制
    return NextResponse.json({
      success: true,
      message: '授权成功！请复制以下授权码：',
      code: code,
      instructions: '请使用此授权码获取刷新令牌'
    });

  } catch (error) {
    console.error('处理授权回调失败:', error);
    return NextResponse.json(
      { error: '处理授权回调失败' },
      { status: 500 }
    );
  }
} 