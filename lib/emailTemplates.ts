export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
}

// 预定义的邮件模板
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'default',
    name: 'Default Template',
    subject: '初期費用0円で、性能、費用対効果に優れた人材を提案。',
    content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>ご担当者様</p>
                    <p>いつもお世話になっております。<br>
                    Family協同組合でございます。</p>
                    <p>この度、外国人材の採用をご検討されている企业様へ、<br>
                    初期费用0円で、性能、费用対効果に優れた人材をご提案させていただきます。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://www.familyorjp.com/zero-fee" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/family-content-2026.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
        </div>
        </a>
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
<tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:20px;font-weight:bold;color:#000000;text-align:center;">もしご興味がございましたら、资料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90%; max-width: 750px; height: 3px; background-color: #000000; margin: 20px auto;"></div>
  </td>
</tr>
</table>
        <!-- Footer -->
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
          <tr>
            <td align="center" style="padding:0;">
              <div style="text-align:left;width:100%;max-width:750px;background-color:#f9f9f9; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px; margin: 20px auto;">
                <p style="margin:0 0 10px 0;">お問い合わせもお気軽にどうぞ。</p>
                <p style="margin:0 0 10px 0;">
                  <span style="font-size:17px; font-weight: bold;">Family協同組合</span><br>
                  担当:菅原 　日本語・中国語・英语・ネーパル语対応<br>
                  TEL：029-886-8181<br>
                  Mobile：080-7141-7987<br>
                  E-mail：<a href="mailto:sugawararina@hotmail.com" style="color:#0056b3; text-decoration:none;">sugawararina@hotmail.com</a>
                </p>
                <p style="margin:0 0 10px 0;">〒300-0043<br>
          茨城県土浦市中央1-1-26　AGビル</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`,
    description: '完全な HTML 构造と画像が含まれるデフォルトの电子メール テンプレート。',
    category: 'default'
  },
  {
    id: 'family-2026',
    name: 'Family 2026',
    subject: 'Family協同組合——外国人材採用初期費用減免',
    content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>お世話になっております。<br>
                    Family協同組合（監理団体）の菅原と申します。</p>
                    <p>人手不足が深刻化する中、外国人材の採用をご検討の企業様も多いかと存じますが、<br>
                    <strong>「初期コスト」や「煩雑な行政手続き」</strong>に不安を感じていませんか？</p>
                    <p>当組合では、そのようなお悩みを解消するため、<br>
                    期間限定の特別プランをご用意いたしました。</p>
                    <p style="text-align:center;">――――――――――――――――――<br>
                    <strong>入国までの初期費用、完全0円</strong><br>
                    （対象期間：2026年3月1日〜2026年12月31日）<br>
                    ――――――――――――――――――</p>
                    <p>本プランでは、技能実習生の受入れにかかる<br>
                    入国までの初期費用をすべて0円でご利用いただけます。</p>
                    <p>■プランの特徴<br>
                    ・入国までの初期費用：完全0円<br>
                    ・監理団体として受入れ手続きを一括サポート<br>
                    ・煩雑な申請業務・書類作成を全面代行<br>
                    ・優良な送出機関と連携し、安定した人材確保<br>
                    ・入国後の生活・就業サポートも充実</p>
                    <p>初めて外国人材を受け入れる企業様でも、<br>
                    安心してスムーズに導入いただける体制を整えております。</p>
                    <p>「コストを抑えて導入したい」<br>
                    「手続きの負担を減らしたい」<br>
                    そのような企業様に最適なプランです。</p>
                    <p>ぜひこの機会にご検討ください。<br>
                    詳細のご説明や導入の流れにつきましては、<br>
                    オンラインでも柔軟に対応可能でございます。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://www.familyorjp.com/zero-fee" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/family-hero-4-20.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
        </div>
        </a>
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
<tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:20px;font-weight:bold;color:#000000;text-align:center;">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90%; max-width: 750px; height: 3px; background-color: #000000; margin: 20px auto;"></div>
  </td>
</tr>
</table>
        <!-- Footer -->
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
          <tr>
            <td align="center" style="padding:0;">
              <div style="text-align:left;width:100%;max-width:750px;background-color:#f9f9f9; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px; margin: 20px auto;">
                <p style="margin:0 0 10px 0;">お問い合わせもお気軽にどうぞ。</p>
                <p style="margin:0 0 10px 0;">
                  <span style="font-size:17px; font-weight: bold;">Family協同組合</span><br>
                  担当:菅原 　日本語・中国語・英語・ネーパル語対応<br>
                  TEL：029-886-8181<br>
                  Mobile：080-7141-7987<br>
                  E-mail：<a href="mailto:sugawararina@hotmail.com" style="color:#0056b3; text-decoration:none;">sugawararina@hotmail.com</a>
                </p>
                <p style="margin:0 0 10px 0;">〒300-0043<br>
          茨城県土浦市中央1-1-26　AGビル</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`,
    description: 'Family協同組合の2026年採用プロモーションテンプレート。',
    category: 'promotion'
  },
  {
    id: 'yalin-2026',
    name: 'Yalin 2026',
    subject: '【送出機関】中国技能実習生受入れ先紹介のご依頼（謝礼20万円）',
    content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>お世話になっております。<br>
                    アリン送出機関の菅原と申します。</p>
                    <p>このたびは、中国人技能実習生の受入れ先企業様をご紹介いただきたく、ご連絡申し上げました。</p>
                    <p>当機関では、これまで多数の企業様に対し、優秀で意欲の高い中国人技能実習生の送り出し実績があり、安定した人材供給と丁寧なサポート体制にご評価をいただいております。<br>
                    現在、受入れ枠の拡大に伴い、新たな受入れ企業様とのご縁を広げております。</p>
                    <p>つきましては、受入れをご検討いただける企業様をご紹介いただいた場合、<br>
                    <strong>1名受け入れて20万円の謝礼（実習生の日本入国後にお支払い）</strong>をお支払いさせていただきます。</p>
                    <p>■ご紹介対象<br>
                    ・技能実習生の受入れにご関心のある企業様<br>
                    ・人手不足の解消や海外人材の活用をご検討中の企業様</p>
                    <p>■当機関の特徴<br>
                    ・厳選された人材のご提案<br>
                    ・来日前教育の徹底（日本語・マナー・技能）<br>
                    ・受入れ後のフォロー体制も充実</p>
                    <p>ご紹介方法や詳細につきましては、お気軽にお問い合わせください。<br>
                    オンラインでのご説明も可能でございます。</p>
                    <p>ぜひこの機会に、貴社およびご関係企業様との新たなご縁をいただけますと幸いです。<br>
                    何卒よろしくお願い申し上げます。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://yalin.asia" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/yalin-hero-4-20.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
        </div>
        </a>
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
<tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:20px;font-weight:bold;color:#000000;text-align:center;">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90%; max-width: 750px; height: 3px; background-color: #000000; margin: 20px auto;"></div>
  </td>
</tr>
</table>
        <!-- Yalin Footer -->
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
          <tr>
            <td align="center" style="padding:0;">
              <div style="text-align:left;width:100%;max-width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px; margin: 0 auto;">
                <p style="margin:0 0 10px 0;">お問い合わせもお気軽にどうぞ。<br>
                </p>
                <p style="margin:0 0 10px 0;">
                  <span style="font-size:17px">福州亜麟創新科技有限公司（日本事務所）</span><br>
                  担当:菅原 　日本語・中国語対応<br>
                  Mobile：080-7141-7987<br>
                  E-mail：<a href="mailto:sugawararina@hotmail.com" style="color:#0056b3; text-decoration:none;">sugawararina@hotmail.com</a>
                </p>
                <p style="margin:0 0 10px 0;">〒300-0043<br>
          茨城県土浦市中央1-1-26　AGビル</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`,
    description: 'Yalin 2026 テンプレート',
    category: 'promotion'
  }
];