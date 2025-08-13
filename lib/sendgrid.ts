import sgMail from '@sendgrid/mail';
import { htmlToText } from './utils';

// 配置SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('SENDGRID_API_KEY 环境变量未设置');
}
sgMail.setApiKey(apiKey);

// 获取发件人邮箱
function getFromEmail(): string {
  return process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
}

// 获取发件人名称
function getFromName(): string {
  return process.env.SENDGRID_FROM_NAME || 'Email System';
}

// 获取应用基础URL
function getBaseUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // 如果是开发环境
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // 生产环境默认使用Vercel域名
  return 'https://email-test-phi.vercel.app';
}

// 生成邮件页脚（包含退订链接）
function generateEmailFooter(email: string): string {
  const baseUrl = getBaseUrl();
  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`
  
  return `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p style="margin: 0 0 10px 0;">
        今後、当弊社からのご案内メールがご不要の場合は、下記のリンクより配信停止できます。
      </p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #007bff; text-decoration: none;">
          配信停止はこちら
        </a>
      </p>
    </div>
  `;
}

// 发送单封邮件
export async function sendSingleEmail(to: string, subject: string, html: string) {  
  try {
    // 将HTML内容转换为纯文本，保持换行格式
    const text = htmlToText(html);

    // 添加退订链接到邮件内容
    const emailWithFooter = html + generateEmailFooter(to);

    // 构建完整的HTML文档
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        p {
            margin: 0 0 1em 0;
        }
        br {
            display: block;
            margin: 0.5em 0;
        }
        .email-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .unsubscribe-link {
            color: #007bff;
            text-decoration: none;
        }
        .unsubscribe-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    ${emailWithFooter}
</body>
</html>`;

    const msg = {
      to: to,
      from: {
        email: getFromEmail(),
        name: getFromName()
      },
      subject: subject,
      html: fullHtml,
      text: text + '\n\n---\nIf you no longer wish to receive our emails, please visit the following link to unsubscribe:\n' + `${getBaseUrl()}/unsubscribe?email=${encodeURIComponent(to)}` + '\nThis email was sent to: ' + to, // 添加纯文本版本的退订信息
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        }
      }
    };

    const response = await sgMail.send(msg);
    return {
      id: response[0]?.headers['x-message-id'] || `sg_${Date.now()}`,
      status: 'sent'
    };
  } catch (error) {
    console.error('SendGrid发送邮件失败:', error);
    
    // 提供更详细的错误信息
    const errorObj = error as any;
    if (errorObj.response) {
      const errors = errorObj.response.body.errors;
      if (errors && errors.length > 0) {
        const errorMsg = errors[0].message;
        if (errorMsg.includes('from address does not match')) {
          throw new Error('发件人邮箱未验证，请在SendGrid控制台验证发件人身份');
        } else if (errorMsg.includes('authorization grant is invalid')) {
          throw new Error('API Key无效或已过期');
        }
      }
    }
    
    throw error;
  }
}

// 批量发送邮件
export async function sendBulkEmails(recipients: string[], subject: string, html: string) {
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

  return results;
}

// 验证SendGrid配置
export function validateConfig() {
  const requiredEnvVars = [
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
  }

  console.log('✅ SendGrid配置验证通过');
  console.log(`发件人邮箱: ${getFromEmail()}`);
  console.log(`发件人名称: ${getFromName()}`);
} 