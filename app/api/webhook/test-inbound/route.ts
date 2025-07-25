import { NextRequest, NextResponse } from 'next/server';

// 存储接收到的webhook数据（仅用于测试）
let webhookHistory: Array<{
  id: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  parsedData?: any;
  analysis?: {
    type: 'email' | 'alert' | 'lead' | 'error' | 'unknown';
    confidence: number;
    summary: string;
  };
}> = [];

// 限制历史记录数量
const MAX_HISTORY = 50;

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  console.log(`🔍 [${requestId}] 收到测试webhook请求`);
  console.log(`📅 时间: ${timestamp}`);

  try {
    // 获取请求头
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`�� 请求头:`, headers);

    // 尝试解析不同类型的请求体
    let body: any = null;
    let parsedData: any = null;
    let contentType = headers['content-type'] || '';

    try {
      if (contentType.includes('application/json')) {
        body = await request.json();
        parsedData = body;
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        body = {};
        parsedData = {};
        
        for (const [key, value] of formData.entries()) {
          body[key] = value;
          parsedData[key] = typeof value === 'string' ? value.substring(0, 500) : value;
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        body = text;
        parsedData = Object.fromEntries(new URLSearchParams(text));
      } else {
        body = await request.text();
        parsedData = body;
      }
    } catch (parseError) {
      console.log(`⚠️ 解析请求体失败:`, parseError);
      body = await request.text();
      parsedData = body;
    }

    console.log(`�� 请求体:`, body);

    // 智能分析webhook类型
    const analysis = analyzeWebhookType(parsedData, headers);
    console.log(`🧠 分析结果:`, analysis);

    // 存储到历史记录
    const webhookEntry = {
      id: requestId,
      timestamp,
      method: 'POST',
      headers,
      body,
      parsedData,
      analysis
    };

    webhookHistory.unshift(webhookEntry);
    
    // 限制历史记录数量
    if (webhookHistory.length > MAX_HISTORY) {
      webhookHistory = webhookHistory.slice(0, MAX_HISTORY);
    }

    // 根据分析结果返回不同的响应
    const response = {
      success: true,
      requestId,
      timestamp,
      analysis,
      message: `Webhook已接收并分析完成`,
      stats: {
        totalReceived: webhookHistory.length,
        typeDistribution: getTypeDistribution()
      }
    };

    console.log(`✅ [${requestId}] 处理完成`);
    return NextResponse.json(response);

  } catch (error) {
    console.error(`❌ [${requestId}] 处理失败:`, error);
    
    const errorResponse = {
      success: false,
      requestId,
      timestamp,
      error: error instanceof Error ? error.message : '未知错误',
      message: 'Webhook处理失败'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'history') {
    // 返回历史记录
    return NextResponse.json({
      success: true,
      history: webhookHistory,
      stats: {
        total: webhookHistory.length,
        typeDistribution: getTypeDistribution()
      }
    });
  }

  if (action === 'clear') {
    // 清空历史记录
    webhookHistory = [];
    return NextResponse.json({
      success: true,
      message: '历史记录已清空'
    });
  }

  // 默认返回接口信息
  return NextResponse.json({
    success: true,
    message: 'Pipedream风格测试接口',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/webhook/test-inbound': '接收webhook请求',
      'GET /api/webhook/test-inbound?action=history': '查看历史记录',
      'GET /api/webhook/test-inbound?action=clear': '清空历史记录'
    },
    features: [
      '自动解析多种数据格式 (JSON, Form-Data, URL-Encoded)',
      '智能分析webhook类型',
      '请求历史记录',
      '实时统计信息'
    ]
  });
}

// 智能分析webhook类型
function analyzeWebhookType(data: any, headers: Record<string, string>): {
  type: 'email' | 'alert' | 'lead' | 'error' | 'unknown';
  confidence: number;
  summary: string;
} {
  let type: 'email' | 'alert' | 'lead' | 'error' | 'unknown' = 'unknown';
  let confidence = 0;
  let summary = '';

  // 检查是否是邮件webhook
  if (data.from || data.to || data.subject || data['message-id']) {
    type = 'email';
    confidence = 0.9;
    summary = `邮件webhook - 发件人: ${data.from || '未知'}, 收件人: ${data.to || '未知'}`;
  }
  // 检查是否是告警webhook
  else if (data.alert || data.warning || data.critical || data.severity) {
    type = 'alert';
    confidence = 0.8;
    summary = `告警webhook - 级别: ${data.severity || data.alert || '未知'}`;
  }
  // 检查是否是潜在客户webhook
  else if (data.lead || data.contact || data.customer || data.name || data.email) {
    type = 'lead';
    confidence = 0.7;
    summary = `潜在客户webhook - 联系人: ${data.name || data.email || '未知'}`;
  }
  // 检查是否是错误webhook
  else if (data.error || data.exception || data.failure || data.status === 'error') {
    type = 'error';
    confidence = 0.8;
    summary = `错误webhook - 错误: ${data.error || data.exception || '未知'}`;
  }
  // 检查User-Agent
  else if (headers['user-agent']?.includes('SendGrid')) {
    type = 'email';
    confidence = 0.6;
    summary = 'SendGrid邮件webhook (基于User-Agent)';
  }
  else if (headers['user-agent']?.includes('GitHub')) {
    type = 'alert';
    confidence = 0.6;
    summary = 'GitHub webhook (基于User-Agent)';
  }

  return { type, confidence, summary };
}

// 获取类型分布统计
function getTypeDistribution() {
  const distribution: Record<string, number> = {};
  webhookHistory.forEach(entry => {
    if (entry.analysis) {
      const type = entry.analysis.type;
      distribution[type] = (distribution[type] || 0) + 1;
    }
  });
  return distribution;
} 