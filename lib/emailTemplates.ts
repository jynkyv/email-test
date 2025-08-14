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
    content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  
  <tr>
    <td align="center" style="padding:0; ">
      <div style="text-align:left;width:750px">
      <span style="font-size:18px;font-weight: bold">Family協同組合</span>は、<br>
技能実習生および受け入れ企業の双方の支援を目的とし、<br>
募集や受け入れに関する調整、指導、監査を行う団体です。<br>
        
      </div>
      </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="border: none;width:750px; height: 1px; background-color: #000000; margin: 20px 0 0 0;"></div>
    </td>
  </tr>
  </table>`,
    description: '',
    category: 'header'
  },
  {
  id: 'db',
  name: '営業部初期費用0円',
  subject: '【初期費用0円】技能実習生受け入れキャンペーン!※このメールは返信可能です※',
  content: `
<div style="max-width: 750px; margin: 0 auto;">
  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
    <img src="https://email-test-gamma.vercel.app/header-1.png" style="width: 100%; display: block;">
  </a>
  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
    <img src="https://email-test-gamma.vercel.app/hero-1.png" style="width: 100%; display: block;">
  </a>
  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
    <img src="https://email-test-gamma.vercel.app/detail-1.png" style="width: 100%; display: block;">
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
{
  id: 'ag',
  name: 'AG',
  subject: '【監理団体様へ】技能実習生送出の新たなご提案！ぜひお見逃しなく！※このメールは返信可能です※',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0; ">
      <div style="font-size:27px;font-weight:bold">技能実習生送出の新しいご提案 ― 福州亜麟 × Open実習生アプリ</div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="border: none;width:750px; height: 3px; background-color: #000000; margin: 20px 0;"></div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="text-align:left;width:750px;line-height:1.5">
      <span style="font-size:20px;">監理団体ご担当者様</span><br>
        <span style="font-size:18px;">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;私たちは技能実習生送出の経験を有し、中国政府認定の信頼ある送出機関「福州亜麟（アリン）有限会社」です。<br>
現在、日本国内の監理団体様との連携を募集しております。<br>
このたび、（株）AGグループと提携し、同社開発の「Open実習生」アプリを活用し、より効率的で透明性の高い技能実習生送出サービスをご案内いたします。<br>
        </span>
      </div>
      </td>
  </tr>
  </table>
<br>
<div style="max-width: 750px; margin: 0 auto;">
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-header-1.png" style="width: 100%; display: block;">
  </div>
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-detail-1.png" style="width: 100%; display: block;">
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/ag-qr-left-1.png" style="width: 100%; display: block;">
    </div>
    <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank" style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/ag-qr-middle-1.png" style="width: 100%; display: block;">
    </a>
    <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank" style="display: inline-block;">
      <img src="https://email-test-gamma.vercel.app/ag-qr-right-1.png" style="width: 100%; display: block;">
    </a>
  </div>
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-footer-1.png" style="width: 100%; display: block;">
  </div>
</div>
<br>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0; ">
      <div style="font-size:27px;font-weight:bold">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="border: none;width:750px; height: 3px; background-color: #000000; margin: 20px 0;"></div>
    </td>
  </tr>
  </table>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">
        <p style="font-size:18px">お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※<br>
          </p>
        <p>
          <span style="font-size:18px">株式会社AGグループ</span>
        </p>
          <div style="font-size:18px;margin:0 0 10px 0">担当:&nbsp;&nbsp;&nbsp;卓（たく）<br>日本語・中国語対応可能</div>
          Mobile: 080-7140-0762<br>
          E-mail: <a href="mailto:taku@aggroup.cc" style="color:#0056b3; text-decoration:none;">taku@aggroup.cc</a>
        </p>
        <p style="margin:0 0 10px 0;">
          〒110-0015<br>
          東京都台東区東上野１丁目8-2<br>オーイズミ東上野東館9階</p>
      <hr>
       <p style="margin:0 0 10px 0;">
          <span style="font-size:18px">福州亚麟科技创新有限责任公司</span>
        </p>
        </p>
          <div style="font-size:18px;margin-bottom:10px">担当:&nbsp;&nbsp;&nbsp;陳（チン）<br>日本語・中国語対応可能</div>
          Mobile: 0452-6668555<br>
          E-mail: <a href="mailto:yalin6668555@163.com" style="color:#0056b3; text-decoration:none;">yalin6668555@163.com</a>
        <p style="margin:10px 0 10px 0;">
          〒350004<br>
          中国福建省福州市台江区工業路360号<br>
          中央第五街2棟620号 </p>
  <p style="margin:0;">© 2025 株式会社AGグループ All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
  description: '完全な HTML 構造と画像が含まれるデフォルトの電子メール テンプレートを使用します。',
  category: 'default'
},

{id: 'db-footer-1',
  name: '一部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">
        <p>お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※
        </p>
          <span style="font-size:18px">担当:&nbsp;&nbsp;&nbsp;柏原</span><br>
          担当エリア: 北海道、東北、関東<br>
          TEL: 080-7141-7786<br>
          E-mail: <a href="mailto:kashiwabara@family-jp.info" style="color:#0056b3; text-decoration:none;">kashiwabara@family-jp.info</a>
        </p>
        <p style="margin:0 0 10px 0;">本部<br>
          〒110-0015<br>
          東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
        <p style="margin:0 0 10px 0;">講習センター<br>
          〒300-0043<br>
          茨城県土浦市中央1丁目1-26 AGビル</p>
        <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
  description: '',
  category: 'footer'
},
{id: 'db-footer-2',
  name: '二部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">
        <p>お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※
        </p>
          <span style="font-size:18px">担当:&nbsp;&nbsp;&nbsp;堀江</span><br>
          担当エリア: 近畿、中部<br>
          TEL: 080-7141-7975<br>
          E-mail: <a href="mailto:horie@family-jp.info" style="color:#0056b3; text-decoration:none;">horie@family-jp.info</a>
        </p>
        <p style="margin:0 0 10px 0;">本部<br>
          〒110-0015<br>
          東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
        <p style="margin:0 0 10px 0;">講習センター<br>
          〒300-0043<br>
          茨城県土浦市中央1丁目1-26 AGビル</p>
        <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
  description: '',
  category: 'footer'
},
{id: 'db-footer-3',
  name: '三部-页脚',
  subject: '',
  content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">
        <p>お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※
        </p>
          <span style="font-size:18px">担当:&nbsp;&nbsp;&nbsp;ハシミ</span><br>
          担当エリア: 中国、四国、九州<br>
          TEL: 080-7141-7752<br>
          E-mail: <a href="mailto:hashmi@family-jp.info" style="color:#0056b3; text-decoration:none;">hashmi@family-jp.info</a>
        </p>
        <p style="margin:0 0 10px 0;">本部<br>
          〒110-0015<br>
          東京都台東区東上野１丁目8-2 オーイズミ東上野東館9階</p>
        <p style="margin:0 0 10px 0;">講習センター<br>
          〒300-0043<br>
          茨城県土浦市中央1丁目1-26 AGビル</p>
        <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
  description: '',
  category: 'footer'
}
]; 