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
    id: 'zb',
    name: '中部邮件模板',
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
      <img src="https://email-test-gamma.vercel.app/header.png" style="width: 100%; display: block;">
    </a>
    <img src="https://email-test-gamma.vercel.app/hero.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/web-button.png" style="width: 100%; display: block;">
    </a>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <a href="" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-detail.png" style="width: 100%; display: block;">
      </a>
      <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-appstore.png" style="width: 100%; display: block;">
      </a>
      <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-googleplay.png" style="width: 100%; display: block;">
      </a>
    </div>
    <img src="https://email-test-gamma.vercel.app/detail.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/footer-zb.png" style="width: 100%; display: block; position: relative; top: -37px;">
    </a>
  </div>
</body>
</html>`,
    description: '使用默认的邮件模板，包含完整的HTML结构和图片',
    category: 'default'
  },
  {
    id: 'jz',
    name: '九州邮件模板',
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
      <img src="https://email-test-gamma.vercel.app/header.png" style="width: 100%; display: block;">
    </a>
    <img src="https://email-test-gamma.vercel.app/hero.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/web-button.png" style="width: 100%; display: block;">
    </a>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <a href="" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-detail.png" style="width: 100%; display: block;">
      </a>
      <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-appstore.png" style="width: 100%; display: block;">
      </a>
      <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-googleplay.png" style="width: 100%; display: block;">
      </a>
    </div>
    <img src="https://email-test-gamma.vercel.app/detail.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/footer-jz.png" style="width: 100%; display: block; position: relative; top: -37px;">
    </a>
  </div>
</body>
</html>`,
    description: '使用默认的邮件模板，包含完整的HTML结构和图片',
    category: 'default'
  },
  {
    id: 'db',
    name: '东北邮件模板',
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
      <img src="https://email-test-gamma.vercel.app/header.png" style="width: 100%; display: block;">
    </a>
    <img src="https://email-test-gamma.vercel.app/hero.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/web-button.png" style="width: 100%; display: block;">
    </a>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <a href="" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-detail.png" style="width: 100%; display: block;">
      </a>
      <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-appstore.png" style="width: 100%; display: block;">
      </a>
      <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank" style="display: inline-block;">
        <img src="https://email-test-gamma.vercel.app/qr-code-googleplay.png" style="width: 100%; display: block;">
      </a>
    </div>
    <img src="https://email-test-gamma.vercel.app/detail.png" style="width: 100%; display: block;">
    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
      <img src="https://email-test-gamma.vercel.app/footer-db.png" style="width: 100%; display: block; position: relative; top: -37px;">
    </a>
  </div>
</body>
</html>`,
    description: '使用默认的邮件模板，包含完整的HTML结构和图片',
    category: 'default'
  }
]; 