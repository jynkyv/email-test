// 邮件模板配置
export interface EmailTemplateConfig {
  baseUrl: string;
  title: string;
}

// 默认邮件模板
export function getDefaultEmailTemplate(config: EmailTemplateConfig): string {
  const { baseUrl, title } = config;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0;">
      <div style="max-width: 750px; margin: 0 auto;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/header.png" alt="Header" style="width: 100%; display: block;">
        </a>
        <img src="${baseUrl}/hero.png" alt="Hero" style="width: 100%; display: block;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/web-button.png" alt="Web Button" style="width: 100%; display: block;">
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0 20px 0;">
          <img src="${baseUrl}/flag.png" alt="Flag" style="width:60%; height: auto;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
            <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
              <img src="${baseUrl}/qrcode-1.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
              <img src="${baseUrl}/app-store.svg" alt="Web Button" style="width: 100%; height: auto;">
            </a>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
            <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
              <img src="${baseUrl}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
              <img src="${baseUrl}/google-play.svg" alt="Web Button" style="width: 100%; height: auto;">
            </a>
          </div>
        </div>
        <img src="${baseUrl}/detail.png" alt="Detail" style="width: 100%; display: block;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/telephone.png" alt="Telephone" style="width: 100%; display: block;">
        </a>
      </div>
    </body>
    </html>
  `;
}

// 预览模板（用于iframe预览）
export function getPreviewEmailTemplate(config: EmailTemplateConfig): string {
  return getDefaultEmailTemplate(config);
}

// 模板类型枚举
export enum TemplateType {
  DEFAULT = 'default',
  SIMPLE = 'simple',
  PROMOTIONAL = 'promotional',
  CUSTOM = 'custom'
}

// 简单邮件模板
export function getSimpleEmailTemplate(config: EmailTemplateConfig): string {
  const { baseUrl, title } = config;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${baseUrl}/header.png" alt="Header" style="max-width: 200px; height: auto;">
        </div>
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">感谢您的关注</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            我们很高兴为您提供服务。如果您有任何问题或需要帮助，请随时联系我们。
          </p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.familyorjp.com/" target="_blank" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            访问我们的网站
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 促销邮件模板
export function getPromotionalEmailTemplate(config: EmailTemplateConfig): string {
  const { baseUrl, title } = config;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0;">
      <div style="max-width: 750px; margin: 0 auto;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/header.png" alt="Header" style="width: 100%; display: block;">
        </a>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0 0 20px 0; font-size: 2.5em;">特别优惠</h1>
          <p style="font-size: 1.2em; margin-bottom: 30px;">限时优惠，不要错过！</p>
          <a href="https://www.familyorjp.com/" target="_blank" style="background-color: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 1.1em; font-weight: bold;">
            立即查看
          </a>
        </div>
        <img src="${baseUrl}/hero.png" alt="Hero" style="width: 100%; display: block;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0 20px 0;">
          <img src="${baseUrl}/flag.png" alt="Flag" style="width:60%; height: auto;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
            <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
              <img src="${baseUrl}/qrcode-1.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
              <img src="${baseUrl}/app-store.svg" alt="Web Button" style="width: 100%; height: auto;">
            </a>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
            <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
              <img src="${baseUrl}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
              <img src="${baseUrl}/google-play.svg" alt="Web Button" style="width: 100%; height: auto;">
            </a>
          </div>
        </div>
        <img src="${baseUrl}/detail.png" alt="Detail" style="width: 100%; display: block;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/telephone.png" alt="Telephone" style="width: 100%; display: block;">
        </a>
      </div>
    </body>
    </html>
  `;
}

// 获取模板函数
export function getEmailTemplate(templateType: TemplateType, config: EmailTemplateConfig): string {
  switch (templateType) {
    case TemplateType.DEFAULT:
      return getDefaultEmailTemplate(config);
    case TemplateType.SIMPLE:
      return getSimpleEmailTemplate(config);
    case TemplateType.PROMOTIONAL:
      return getPromotionalEmailTemplate(config);
    case TemplateType.CUSTOM:
      // 这里可以添加自定义模板
      return getDefaultEmailTemplate(config);
    default:
      return getDefaultEmailTemplate(config);
  }
} 