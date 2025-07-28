import sgMail from '@sendgrid/mail';

// 设置SendGrid API Key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('SENDGRID_API_KEY环境变量未设置');
}
sgMail.setApiKey(apiKey);

// 获取发件人邮箱和名称
function getFromEmail(): string {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error('SENDGRID_FROM_EMAIL环境变量未设置');
  }
  return fromEmail;
}

// 获取发件人名称
function getFromName(): string {
  const fromName = process.env.SENDGRID_FROM_NAME || '邮件管理系统';
  return fromName;
}

// 发送单封邮件
export async function sendSingleEmail(to: string, subject: string, html: string) {
  try {
    // 将HTML内容转换为纯文本，保持换行格式
    const text = html
      .replace(/<br\s*\/?>/gi, '\n')  // 将<br>标签转换为换行
      .replace(/<\/p>/gi, '\n\n')     // 将</p>标签转换为双换行
      .replace(/<p[^>]*>/gi, '')      // 移除<p>开始标签
      .replace(/<[^>]*>/g, '')        // 移除所有其他HTML标签
      .replace(/&nbsp;/g, ' ')        // 将&nbsp;转换为空格
      .replace(/&amp;/g, '&')         // 将&amp;转换为&
      .replace(/&lt;/g, '<')          // 将&lt;转换为<
      .replace(/&gt;/g, '>')          // 将&gt;转换为>
      .replace(/&quot;/g, '"')        // 将&quot;转换为"
      .replace(/&#39;/g, "'")         // 将&#39;转换为'
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 清理多余的空行
      .trim();

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
    </style>
</head>
<body>
    ${html}
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
      text: text, // 添加纯文本版本
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

// 验证配置
export function validateConfig() {
  const issues = [];
  
  if (!apiKey) {
    issues.push('SENDGRID_API_KEY环境变量未设置');
  } else if (!apiKey.startsWith('SG.')) {
    issues.push('SENDGRID_API_KEY格式错误，应该以SG.开头');
  }
  
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    issues.push('SENDGRID_FROM_EMAIL环境变量未设置');
  }
  
  const fromName = process.env.SENDGRID_FROM_NAME;
  if (!fromName) {
    issues.push('SENDGRID_FROM_NAME环境变量未设置（可选，默认为"邮件管理系统"）');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    config: {
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : '未设置',
      fromEmail: fromEmail || '未设置',
      fromName: fromName || '邮件管理系统'
    }
  };
} 