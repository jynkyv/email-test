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
          <img src="${baseUrl}/header.png" style="width: 100%; display: block;">
        </a>
        <img src="${baseUrl}/hero.png" style="width: 100%; display: block;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/web-button.png" style="width: 100%; display: block;">
        </a>
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/qr-code.png" style="width: 100%; display: block;">
        </a>
        <img src="${baseUrl}/detail.png" style="width: 100%; display: block;">
        <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
          <img src="${baseUrl}/telephone.png" style="width: 100%; display: block;">
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