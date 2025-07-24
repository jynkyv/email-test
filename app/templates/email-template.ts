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
              <img src="${baseUrl}/app-store.png" alt="App Store" style="width: 100%; height: auto;">
            </a>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
            <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
              <img src="${baseUrl}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
              <img src="${baseUrl}/google-play.png" alt="Google Play" style="width: 100%; height: auto;">
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
  CUSTOM = 'custom'
}



// 获取模板函数
export function getEmailTemplate(templateType: TemplateType, config: EmailTemplateConfig): string {
  switch (templateType) {
    case TemplateType.DEFAULT:
      return getDefaultEmailTemplate(config);
    case TemplateType.CUSTOM:
      // 这里可以添加自定义模板
      return getDefaultEmailTemplate(config);
    default:
      return getDefaultEmailTemplate(config);
  }
} 