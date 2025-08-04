export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
}

// 预定义的邮件模板 - 使用默认邮件模板内容
export const EMAIL_TEMPLATES: EmailTemplate[] = [{
  id: 'db',
  name: '営業部1初期費用0円',
  subject: '【初期費用0円】技能実習生受け入れキャンペーン!',
  content: `
<br>
<div style="max-width: 750px; margin: 0 auto;">
  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
    <img src="https://email-test-gamma.vercel.app/hero-1.png" style="width: 100%; display: block;">
  </a>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/footer-left-1.png" style="width: 100%; display: block;">
    </div>
    <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank" style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/footer-middle-1.png" style="width: 100%; display: block;">
    </a>
    <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank" style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/footer-right-1.png" style="width: 100%; display: block;">
    </a>
  </div>
</div>
<br>
`,
  description: '完全な HTML 構造と画像が含まれるデフォルトの電子メール テンプレートを使用します。',
  category: 'default'
}
]; 