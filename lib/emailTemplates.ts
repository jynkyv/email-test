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
    id: 'db-header',
    name: '页头',
    subject: '',
    content: `<span style="font-size:24px;font-weight:bold;">Family協同組合</span>は、技能実習制度の適切な運用と、技能実習生および受け入れ企業の双方の支援を目的とし、募集や受け入れに関する調整、指導、監査を行う団体です。`,
    description: '',
    category: 'header'
  },
  {
  id: 'db',
  name: '営業部初期費用0円',
  subject: '【初期費用0円】技能実習生受け入れキャンペーン!※このメールは返信可能です※',
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
},

{id: 'db-footer',
  name: '一部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; background-color:#f4f4f4; color:#333333;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; width:600px; max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
          <td style="background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; text-align:left; border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 10px 0;">
            <p>お問い合わせもお気軽にどうぞ。<br>
              ※このメールは返信可能です※
            </p>
              Family協同組合<br>
              担当: 柏原　悠人<br>
              担当エリア:北海道、東北、関東<br>
              TEL：080-7141-7786<br>
              E-mail：<a href="mailto:kashiwabara@family-jp.info">kashiwabara@family-jp.info</a></p>
            <p style="margin:0 0 10px 0;">本部<br>
              〒110-0015<br>
              東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
            <p style="margin:0 0 10px 0;">講習センター<br>
              〒300-0043<br>
              茨城県土浦市中央1丁目1-26 AGビル</p>
            <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`,
  description: '',
  category: 'footer'
},
{id: 'db-footer',
  name: '二部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; background-color:#f4f4f4; color:#333333;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; width:600px; max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
          <td style="background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; text-align:left; border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 10px 0;">
            <p>お問い合わせもお気軽にどうぞ。<br>
              ※このメールは返信可能です※
            </p>
              Family協同組合<br>
              担当: 堀江　信吾<br>
              担当エリア:近畿、中部<br>
              TEL：080-7141-7975<br>
              E-mail：<a href="mailto:horie@family-jp.info" style="color:#0056b3; text-decoration:none;">horie@family-jp.info</a>
            </p>
            <p style="margin:0 0 10px 0;">本部<br>
              〒110-0015<br>
              東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
            <p style="margin:0 0 10px 0;">講習センター<br>
              〒300-0043<br>
              茨城県土浦市中央1丁目1-26 AGビル</p>
            <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`,
  description: '',
  category: 'footer'
},
{id: 'mid-footer',
  name: '三部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; background-color:#f4f4f4; color:#333333;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; width:600px; max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
          <td style="background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; text-align:left; border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 10px 0;">
            <p>お問い合わせもお気軽にどうぞ。<br>
              ※このメールは返信可能です※
            </p>
              Family協同組合<br>
              担当: ハシミ　アンマール　アリ<br>
              担当エリア:中国、四国、九州<br>
              TEL：080-7141-7752<br>
              E-mail：<a href="mailto:hashmi@family-jp.info">hashmi@family-jp.info</a></p>
            <p style="margin:0 0 10px 0;">本部<br>
              〒110-0015<br>
              東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
            <p style="margin:0 0 10px 0;">講習センター<br>
              〒300-0043<br>
              茨城県土浦市中央1丁目1-26 AGビル</p>
            <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`,
  description: '',
  category: 'footer'
}
]; 