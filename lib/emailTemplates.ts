export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
}

// 预定义的邮件模板 - 使用默认邮件模板内容
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'default',
    name: '默认邮件模板',
    subject: '【初期費用0円】技能実習生受け入れキャンペーン!',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【初期費用0円】技能実習生受け入れキャンペーン!</title>
</head>
<body style="margin: 0; padding: 0;">
  <div style="max-width: 750px; margin: 0 auto;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="/header.png" style="width: 100%; display: block;">
    </a>
    <img src="/hero.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="/web-button.png" style="width: 100%; display: block;">
    </a>
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="/qr-code.png" style="width: 100%; display: block;">
    </a>
    <img src="/detail.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="/telephone.png" style="width: 100%; display: block;">
    </a>
  </div>
</body>
</html>`,
    description: '使用默认的邮件模板，包含完整的HTML结构和图片',
    category: 'default'
  }
]; 