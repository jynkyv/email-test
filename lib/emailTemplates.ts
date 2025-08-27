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
    content: `<table role="presentation" align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
   <tr>
  <td align="left" style="padding:0; ">
    <div style="font-size:clamp(18px, 2.7vw, 26px);font-weight:bold;color:#000000;max-width:750px;margin:0 auto">技能実習生の採用・受入なら、Family協同組合</div>
  </td>
</tr>
    <tr>
    <td align="left" style="padding:0; ">
      <div style="width:750px;color: #000000;font-size: 18px;max-width:750px;margin:0 auto">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;私たちFamily協同組合は、企業様に安心してお任せいただける監理団体として、<br>
技能実習生の受け入れに関わるサポート業務を誠実かつ丁寧に行っております。
      </div>
      </td>
  </tr>
  </table>`,
    description: '',
    category: 'header'
  },
  {
  id: 'db',
  name: '営業部初期費用0円',
  subject: '【初期費用無料に挑戦！】技能実習生の採用・受入ならFamily協同組合！※このメールは返信可能です※',
  content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
<div style="max-width: 750px; margin: 0 auto;">
  <a href="https://www.familyorjp.com/"><img src="https://email-test-gamma.vercel.app/family-hero-2.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/></a>
  <!-- 外层卡片 -->
  <div style="background:#fff;overflow:hidden;border:clamp(20px, 2.5vw, 34px) solid #D61518;">
    <!-- 说明文字 -->
    <div style="padding:0 clamp(12px, 1.5vw, 22px) clamp(10px, 1.2vw, 16px) clamp(12px, 1.5vw, 22px);font-size:clamp(14px, 1.6vw, 40px);font-weight: 900; letter-spacing: 0em;line-height:1.7;color: #d8202f;text-align:center;">
      特別無料キャンペーン
    </div>

    <!-- 表格标题行 -->
    <div style="padding:0 clamp(6px, 0.8vw, 18px) clamp(6px, 0.8vw, 18px) clamp(6px, 0.8vw, 18px); width:calc(100% - clamp(12px, 1.6vw, 36px));">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:clamp(1px, 0.12vw, 3px) solid #e5e9f2; font-weight: 700;">
        <!-- 表头 -->
        <tr style="background:#f1f6fb;font-weight:900;">
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 1vw, 20px);color:#d8202f;">初期費用項目</td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: gray;color:white;text-align:center;font-size:clamp(8px, 1vw, 20px)">他社</td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: #c9ecf5;text-align:center;font-size:clamp(8px, 1vw, 20px); font-weight: 900;background-color: #f6bbb9;color:#d8202f;">初期費用項目</td>
          <td style="width:120px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 1vw, 20px); font-weight: 900;"><img src="https://email-test-gamma.vercel.app/family-logo-1.png" alt="" style="height:clamp(14px, 1.8vw, 28px); border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" /></td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: #3c85c7;color:white;text-align:center;font-size:clamp(8px, 1vw, 20px); font-weight: 900;">無料の理由</td>
        </tr>

        <!-- 1 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5; border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">技能実習計画認<br>定申請手数料</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b; font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">3,900</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">技能実習計画認<br>定申請手数料</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">当組合の<br>サポートスタッフ<br>が書類作成を指導</td>
        </tr>

        <!-- 2 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">在留資格認定証明<br>書交付申請費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">55,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">在留資格認定証明<br>書交付申請費</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">経験豊富な<br>スタッフが<br>ビザ申請をサポート</td>
        </tr>

        <!-- 3 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">入国渡航費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">77,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">入国渡航費</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">当組合が負担</td>
        </tr>

        <!-- 4 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">入国前講習費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">15,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(非課税)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">入国前講習費</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">実績のある送出機関での講習を実施</td>
        </tr>

        <!-- 5 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">入国後講習費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">110,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">入国後講習費</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">当組合の講習センターで講習を実施</td>
        </tr>

        <!-- 6 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">実習生への<br>講習手当</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">60,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">実習生への<br>講習手当</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">当組合が負担</td>
        </tr>

        <!-- 7 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">健康診断</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">11,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">健康診断</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size: clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">当組合が負担</td>
        </tr>

        <!-- 8 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);">国内人件費<br>経費等</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">77,000</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(7px, 0.8vw, 18px);background-color: #f6bbb9;">国内人件費<br>経費等</td>
          <td style="width:120px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(8px, 1.1vw, 22px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">アプリで一元管理</td>
        </tr>

        <!-- 合計 -->
        <tr>
          <td style="padding:clamp(4px, 0.5vw, 10px) 0;font-weight:800;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 1vw, 18px);">合計</td>
          <td style="width:160px;padding:clamp(4px, 0.5vw, 10px) 0;font-weight:800;border: 1px solid #164a7b;font-size:clamp(8px, 1.1vw, 22px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">408,900</span><span style="font-size:clamp(8px, 1.1vw, 22px);font-weight:bold;">円</span><span style="font-size:clamp(4px, 0.5vw, 10px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(4px, 0.5vw, 10px) 0;font-weight:800;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 1vw, 18px);background-color: #f6bbb9;">合計</td>
          <td style="width:120px;border-left:1px solid #f5d6d6;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;border-radius:clamp(2px, 0.25vw, 6px);">
              <span style="font-size:clamp(16px, 2vw, 36px)">0</span>
              <span style="font-size:clamp(4px, 1vw, 12px)">円</span>
            </span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(6px, 0.7vw, 14px);">※組合加入費別途</td>
        </tr>
      </table>

      <!-- 备注 -->
      <div style="margin-top:clamp(4px, 0.5vw, 8px);font-size:clamp(7px, 0.8vw, 12px);color:#d8202f;font-weight: 900;">※受入れ後費用概算(1名あたり)&nbsp;※お申込みは先着順となっております、枠がなくなり次第終了となります。</div>
    </div>
    </div>
  <div style="display: block;">
    <a href="https://www.familyorjp.com/">
    <img src="https://email-test-gamma.vercel.app/family-detail-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
  </a>
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td style="width: 50%; text-align: center;">
        <img src="https://email-test-gamma.vercel.app/ag-qr-left-1.png" style="width: 100%; max-width: 400px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
      </td>
      <td style="width: 25%; text-align: center;">
        <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank">
          <img src="https://email-test-gamma.vercel.app/ag-qr-middle-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
        </a>
      </td>
      <td style="width: 25%; text-align: center;">
        <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank">
          <img src="https://email-test-gamma.vercel.app/ag-qr-right-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
        </a>
      </td>
    </tr>
  </table>
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-footer-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
  </div>
</div>
</div>
<br>
</div>
`,
  description: '完全な HTML 構造と画像が含まれるデフォルトの電子メール テンプレートを使用します。',
  category: 'default'
},
{
  id: 'ag',
  name: 'AG',
  subject: '【監理団体様へ】技能実習生送出の新たなご提案！ぜひお見逃しなく！※このメールは返信可能です※',
  content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:clamp(20px, 3vw, 28px);font-weight:bold;color:#000000;">技能実習生送出の新しいご提案 ― 福州亜麟 × Open実習生アプリ</div>
  </td>
</tr>
    <tr>
  <td align="center" style="padding:0; ">
    <div style="text-align:left;width: 90vw; max-width: 750px; line-height:1.5;margin-top:clamp(10px, 1.5vw, 20px);">
    <span style="font-size:clamp(16px, 2vw, 24px);color:#000000;">監理団体ご担当者様</span><br>
      <span style="font-size:clamp(14px, 1.8vw, 20px);color:#000000;">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;私たちは実習生送出の経験を有し、中国政府認定の信頼ある送出機関「福州亜麟(アリン)有限会社」です。現在、 <span style="font-size:clamp(18px, 1.8vw, 24px);color:#000000;font-weight:bold;">日本国内の連携監理団体様</span>を募集しております。
      </span><br>
      <span style="font-size:clamp(14px, 1.8vw, 20px);color:#000000;">
当機構は、中国籍の技能実習生の送出を専門に行っており、現地公的機関との強固な繋がりを活かし、幅広い人材を安定的に紹介可能です。
</span>
    </div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="max-width: 750px; margin: 0 auto;">
      <div style="display: block; margin-top:clamp(10px, 1.5vw, 20px);margin-bottom:clamp(10px, 1.5vw, 20px);">
        <img src="https://email-test-gamma.vercel.app/qilin.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
      </div>
    </div>
  </td>
</tr>
    <tr>
  <td align="center" style="padding:0;">
    <div style="text-align:left;width: 90vw; max-width: 750px; line-height:1.5;margin-bottom:clamp(10px, 1.5vw, 20px);">
      <span style="font-size:clamp(14px, 1.8vw, 20px);color:#000000;">
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;このたび、（株）AGグループと提携し、同社開発の「Open実習生」アプリを活用した、より効率的、かつ透明性の高い実習生送出サービスをご案内いたしております。
      </span><br>
    </div>
  </td>
</tr>
</table>
<div style="max-width: 750px; margin: 0 auto;">
  <!-- 外层卡片 -->
  <div style="background:#fff;overflow:hidden;border:clamp(20px, 2.5vw, 34px) solid #D61518;">

    <!-- 头部：左侧品牌 + 右侧说明 -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0; padding:0;">
      <tr>
        <td style="padding:clamp(12px, 1.5vw, 18px) clamp(15px, 2vw, 22px) clamp(8px, 1vw, 12px) clamp(15px, 2vw, 22px);">
          <img src="https://email-test-gamma.vercel.app/ag-detail-header-1.png" alt="" style="width:100%;height:clamp(60px, 8vw, 94px);object-fit:contain; border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
        </td>
      </tr>
    </table>

    <!-- 说明文字 -->
    <div style="padding:0 clamp(12px, 1.5vw, 22px) clamp(10px, 1.2vw, 16px) clamp(12px, 1.5vw, 22px);font-size:clamp(14px, 1.6vw, 20px);font-weight: 900; letter-spacing: 0em;line-height:1.7;color: #0061ae;">
      株式会社AGグループは、福州亜麟の提携会社であり、<br />
      同社の講習センターを有し、日本入国後の講習を実施しています。
    </div>

    <!-- 表格标题行 -->
    <div style="padding:0 clamp(6px, 0.8vw, 18px) clamp(6px, 0.8vw, 18px) clamp(6px, 0.8vw, 18px); width:calc(100% - clamp(12px, 1.6vw, 36px));">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:clamp(1px, 0.12vw, 3px) solid #e5e9f2; font-weight: 700;">
        <!-- 表头 -->
        <tr style="background:#f1f6fb;font-weight:900;">
          <td style="width:140px;padding:clamp(2px, 0.25vw, 6px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(10px, 1.2vw, 22px);">初期費用項目</td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: gray;color:white;text-align:center;font-size:clamp(10px, 1.2vw, 22px)">企業負担</td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: white;text-align:center;">
            <img src="https://email-test-gamma.vercel.app/ag-openwork-logo-1.png" alt="" style="height:clamp(14px, 1.8vw, 28px); border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
          </td>
          <td style="width:160px;padding:clamp(2px, 0.25vw, 6px) 0;border: 1px solid #164a7b;background-color: #c9ecf5;font-size:clamp(10px, 1.2vw, 22px); font-weight: 900; text-align:center;">無料の理由</td>
        </tr>

        <!-- 1 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5; border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">入国渡航費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b; font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">77,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size:clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">亜麟（有）が負担</td>
        </tr>

        <!-- 2 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">入国前講習費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">15,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(非課税)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">亜麟（有）が負担</td>
        </tr>

        <!-- 3 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">入国後講習費</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">110,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">連携会社<br><div style="font-size:clamp(6px, 0.7vw, 12px);">（株）AGグループが負担</div></td>
        </tr>

        <!-- 4 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">実習生への<br>講習手当</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">60,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(非課税)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">亜麟（有）が負担</td>
        </tr>

        <!-- 5 -->
        <tr>
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">健康診断</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">110,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900; font-size: clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">亜麟（有）が負担</td>
        </tr>

        <!-- 6 -->
        <tr style="background:#fcfdff;">
          <td style="padding:clamp(3px, 0.4vw, 8px) 0;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(9px, 1.1vw, 20px);">国内人件費<br>経費等</td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">77,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;font-weight:900;font-size:clamp(10px, 1.3vw, 24px)">無料</span>
          </td>
          <td style="width:160px;padding:clamp(3px, 0.4vw, 8px) 0;border: 1px solid #164a7b;text-align:center;font-size:clamp(8px, 0.9vw, 16px);">アプリで一元管理</td>
        </tr>

        <!-- 合計 -->
        <tr style="background:#fff7f7;">
          <td style="padding:clamp(4px, 0.5vw, 10px) 0;font-weight:800;background-color: #c9ecf5;border: 1px solid #164a7b;text-align:center;font-size:clamp(10px, 1.2vw, 20px);">合計</td>
          <td style="width:160px;padding:clamp(4px, 0.5vw, 10px) 0;font-weight:800;border: 1px solid #164a7b;font-size:clamp(10px, 1.3vw, 24px);text-align:right;">
            <div style="display:inline-block;text-align:left;">
              <span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">350,000</span><span style="font-size:clamp(10px, 1.3vw, 24px);font-weight:bold;">円</span><span style="font-size:clamp(6px, 0.7vw, 12px);font-weight:bold;">(税込)</span>
            </div>
          </td>
          <td style="width:160px;border-left:1px solid #f5d6d6;border: 1px solid #164a7b;text-align:center;">
            <span style="color:#d8322a;border-radius:clamp(2px, 0.25vw, 6px);font-weight:900;">
              <span style="font-size:clamp(20px, 2.5vw, 40px)">0</span>
              <span style="font-size:clamp(6px, 0.7vw, 12px)">円</span>
            </span>
          </td>
          <td style="padding:clamp(4px,0.6vw,8px) clamp(1px,0.2vw,2px);border:clamp(1px,0.1vw,1px) solid #164a7b;text-align:center;background:linear-gradient(to bottom left,transparent calc(50% - 1px),#164a7b calc(50% - 1px),#164a7b calc(50% + 1px),transparent calc(50% + 1px))"></td>
        </tr>
      </table>

      <!-- 备注 -->
      <div style="margin-top:clamp(4px, 0.5vw, 8px);font-size:clamp(7px, 0.8vw, 12px);color:#000000;font-weight: 900;">※受入れ後費用概算(1名あたり)&nbsp;※お申込みは先着順となっております、枠がなくなり次第終了となります。</div>
    </div>
    </div>
    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
      <tr>
        <td align="center" style="padding-top:clamp(10px,1.5vw,10px);padding-bottom:clamp(10px,1.5vw,10px) ">
          <div style="text-align:left;width: 90vw; max-width: 750px; line-height:1.5">
            <span style="font-size:clamp(14px, 1.8vw, 20px);color:#000000;">
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;これらのサービスは、新たに業務提携をご締結いただく監理団体様にもすべて無料でご提供しております。初めての連携でも安心して導入いただける体制を整えております。
            </span>
          </div>
        </td>
      </tr>
    </table>
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-detail-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td style="width: 50%; text-align: center;">
        <img src="https://email-test-gamma.vercel.app/ag-qr-left-1.png" style="width: 100%; max-width: 400px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
      </td>
      <td style="width: 25%; text-align: center;">
        <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank">
          <img src="https://email-test-gamma.vercel.app/ag-qr-middle-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
        </a>
      </td>
      <td style="width: 25%; text-align: center;">
        <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank">
          <img src="https://email-test-gamma.vercel.app/ag-qr-right-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
        </a>
      </td>
    </tr>
  </table>
  <div style="display: block;">
    <img src="https://email-test-gamma.vercel.app/ag-footer-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
  </div>
</div>
</div>
<br>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
<tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:clamp(14px, 2.7vw, 30px);font-weight:bold;color:#000000;">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90vw; max-width: 750px; height: clamp(2px, 0.3vw, 4px); background-color: #000000; margin: clamp(15px, 2vw, 25px) 0;"></div>
  </td>
</tr>
</table>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
<tr>
  <td align="center" style="padding:0;">
    <div style="text-align:left;width: 90vw; max-width: 750px; background-color:#0000; color:#000000; padding:clamp(15px, 2vw, 25px) clamp(20px, 3vw, 35px); font-size:clamp(12px, 1.4vw, 18px); border-radius:clamp(6px, 0.8vw, 10px);">
      <p style="font-size:clamp(14px, 1.8vw, 22px)">お問い合わせもお気軽にどうぞ。<br>
        ※このメールは返信可能です※<br>
      </p>
      <p>
        <span style="font-size:clamp(14px, 1.8vw, 22px)">株式会社AGグループ</span>
      </p>
      <div style="font-size:clamp(14px, 1.8vw, 22px);margin:0 0 clamp(8px, 1vw, 12px) 0">担当:&nbsp;&nbsp;&nbsp;菅原（スガワラ）<br>日本語・中国語対応可能</div>
      <p>
        Mobile: 080-7140-0762<br>
        E-mail: <a href="mailto:taku@aggroup.cc" style="color:#0056b3; text-decoration:none;">taku@aggroup.cc</a>
      </p>
      <p style="margin:0 0 clamp(8px, 1vw, 12px) 0;">
        〒110-0015<br>
        東京都台東区東上野１丁目8-2<br>オーイズミ東上野東館9階
      </p>
      <div style="border: none;width: 90vw; max-width: 750px; height: clamp(1px, 0.1vw, 2px); background-color: #000000; margin: clamp(15px, 2vw, 25px) 0;"></div>
      <p style="margin:0 0 clamp(8px, 1vw, 12px) 0;">
        <span style="font-size:clamp(14px, 1.8vw, 22px)">福州亜麟科技创新有限责任公司</span>
      </p>
      <div style="font-size:clamp(14px, 1.8vw, 22px);margin-bottom:clamp(8px, 1vw, 12px)">担当:&nbsp;&nbsp;&nbsp;陳（チン）<br>日本語・中国語対応可能</div>
      <p>
        Mobile: 0452-6668555<br>
        E-mail: <a href="mailto:yalin6668555@163.com" style="color:#0056b3; text-decoration:none;">yalin6668555@163.com</a>
      </p>
      <p style="margin:clamp(8px, 1vw, 12px) 0 clamp(8px, 1vw, 12px) 0;">
        〒350004<br>
        中国福建省福州市台江区工業路360号<br>
        中央第五街2棟620号
      </p>
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