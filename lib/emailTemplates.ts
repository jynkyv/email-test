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
  content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;">
    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0; ">
      <div style="font-size:27px;font-weight:bold;color:#000000;">技能実習生送出の新しいご提案 ― 福州亜麟 × Open実習生アプリ</div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="border: none;width:750px; height: 3px; background-color: #000000;margin:20px 0;"></div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0; ">
      <div style="text-align:left;width:750px;line-height:1.5">
      <span style="font-size:20px;color:#000000;">監理団体ご担当者様</span><br>
        <span style="font-size:18px;color:#000000;">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;私たちは技能実習生送出の経験を有し、中国政府認定の信頼ある送出機関「福州亜麟（アリン）有限会社」です。
現在、日本国内の監理団体様との連携を募集しております。<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;このたび、（株）AGグループと提携し、同社開発の「Open実習生」アプリを活用し、より効率的で透明性の高い技能実習生送出サービスをご案内いたします。<br>
        </span>
      </div>
      </td>
  </tr>
  </table>
<br>
<div style="max-width: 750px; margin: 0 auto;">
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-hero-1.png" style="width: 100%; display: block;">
  </div>
  <!-- 外层卡片 -->
  <div style="background:#fff;overflow:hidden;border:34px solid #D61518;">

    <!-- 头部：左侧品牌 + 右侧说明 -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0; padding:0;">
      <tr>
        <td style="padding:18px 22px 12px 22px;">
          <img src="https://email-test-gamma.vercel.app/ag-detail-header-1.png" alt="" style="height:94px;object-fit:contain;" />
        </td>
      </tr>
    </table>

    <!-- 说明文字 -->
    <div style="padding:0 22px 16px 22px;font-size:20px;font-weight: 900; letter-spacing: 0em;line-height:1.7;color: #0061ae;">
      株式会社ＡＧグループは、福州亞鱗の提携会社であり、<br />
      自社の講習センターを有し、日本人国般の講習を実施しています。
    </div>

    <!-- 表格标题行 -->
    <div style="padding:0 18px 18px 18px; width:calc(100% - 36px);">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:3px solid #e5e9f2; font-weight: 700;">
        <!-- 表头 -->
        <tr style="background:#f1f6fb;font-weight:900;">
          <td style="width:140px;padding:6px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:22px;">初期費用項目</td>
          <td style="width:160px;padding:6px 0;border: 1px solid #164a7b;background-color: gray;color:white;text-align:center;font-size:22px">企業負担</td>
          <td style="width:160px;padding:6px 0;border: 1px solid #164a7b;background-color: white;text-align:center;">
            <img src="https://email-test-gamma.vercel.app/ag-openwork-logo-1.png" alt="" style="height:28px;" />
          </td>
          <td style="width:160px;padding:6px 0;border: 1px solid #164a7b;background-color: #c9ecf5;font-size:22px; font-weight: 900; text-align:center;">無料の理由</td>
        </tr>

        <!-- 1 -->
        <tr>
          <td style="padding:8px 0;background-color: #c9ecf5; border: 1px solid #164a7b;text-align:center;font-size:20px;">入国渡航費</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b; font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">77,000</span><span style="font-size:18px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size:24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">亞鱗（者）が負担</td>
        </tr>

        <!-- 2 -->
        <tr style="background:#fcfdff;">
          <td style="padding:8px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">入国前講習費</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">15,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">亞鱗（者）が負担</td>
        </tr>

        <!-- 3 -->
        <tr>
          <td style="padding:8px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">入国後講習費</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">110,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">連携会社<br><div style="font-size:12px;">（株）AGグループが負担</div></td>
        </tr>

        <!-- 4 -->
        <tr style="background:#fcfdff;">
          <td style="padding:8px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">実習生への<br>講習手当</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">60,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">亞鱗（者）が負担</td>
        </tr>

        <!-- 5 -->
        <tr>
          <td style="padding:8px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">健康診断</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">110,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size: 24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">亞鱗（者）が負担</td>
        </tr>

        <!-- 6 -->
        <tr style="background:#fcfdff;">
          <td style="padding:8px 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">国内人件費<br>経費等</td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">77,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:24px">無料</span>
          </td>
          <td style="width:160px;padding:8px 0;border: 1px solid #164a7b;text-align:center;font-size:16px;">アプリで一元管理</td>
        </tr>

        <!-- 合計 -->
        <tr style="background:#fff7f7;">
          <td style="padding:10px 0;font-weight:800;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:20px;">合計</td>
          <td style="width:160px;padding:10px 0;font-weight:800;border: 1px solid #164a7b;font-size:24px;text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:24px;font-weight:bold;">350,000</span><span style="font-size:24px;font-weight:bold;">円</span><span style="font-size:12px;font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;border-left:1px solid #f5d6d6;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;border-radius:6px;font-weight:900;">
              <span style="font-size:40px">0</span>
              <span style="font-size:12px">円</span>
            </span>
          </td>
          <td style="width:160px;padding:10px 0;border: 1px solid #164a7b;text-align:center;background: linear-gradient(to bottom left, transparent calc(50% - 1px), #164a7b calc(50% - 1px), #164a7b calc(50% + 1px), transparent calc(50% + 1px));"></td>
        </tr>
      </table>

      <!-- 备注 -->
      <div style="margin-top:8px;font-size:12px;color:#8a94a6;">※受入れ後費用明細（1名あたり）</div>
    </div>
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
      <div style="font-size:27px;font-weight:bold;color:#000000;">もしご興味がございましたら、資料の送付も可能です。<br>
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
      <div style="border: none;width:750px; height: 1px; background-color: #000000; margin: 20px 0;"></div>
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
</table>
  </div>`,
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