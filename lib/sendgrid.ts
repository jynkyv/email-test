import sgMail from '@sendgrid/mail';

// 设置SendGrid API Key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('SENDGRID_API_KEY环境变量未设置');
}
sgMail.setApiKey(apiKey);

// 获取发件人邮箱
function getFromEmail(): string {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error('SENDGRID_FROM_EMAIL环境变量未设置');
  }
  return fromEmail;
}

// 发送单封邮件
export async function sendSingleEmail(to: string, subject: string, html: string) {
  try {
    const msg = {
      to: to,
      from: getFromEmail(),
      subject: subject,
      html: html,
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
  
  return {
    isValid: issues.length === 0,
    issues,
    config: {
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : '未设置',
      fromEmail: fromEmail || '未设置'
    }
  };
} 