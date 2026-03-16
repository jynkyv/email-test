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
                    <p>いつもお世話になっております。<br>
                    Family協同組合でございます。</p>
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
    <div style="font-size:20px;font-weight:bold;color:#000000;text-align:center;">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90%; max-width: 750px; height: 3px; background-color: #000000; margin: 20px auto;"></div>
  </td>
</tr>
<tr>
    <td align="center" style="padding:0;">
        <div style="text-align:left;width:100%;max-width:750px; color:#333333; padding:20px 30px; font-size:16px; line-height: 1.8; margin: 0 auto; box-sizing: border-box;">
            <p>現在、多くの企業様が人手不足に直面している中、外国人材の採用をご検討されている企業様も増えております。一方で、「初期コスト」や「煩雑な行政手続き」に不安を感じていらっしゃる企業様も多いのではないでしょうか。</p>
            <p>そこで当組合では、外国人技能実習生の受け入れをご検討の企業様に向けて、採用初期費用を減免する特別な取り組みを実施しております。</p>
            <p>本取り組みでは、<br>
            ・採用までの初期費用を大幅に軽減<br>
            ・煩雑な行政手続きを当組合が一括サポート<br>
            ・入国前に約4カ月間の質の高い教育を実施</p>
            <p>など、企业様が安心して外国人材を受け入れていただける体制を整えております。</p>
        </div>
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
        id: 'yalin-v1',
        name: 'Yalin (Option 1)',
        subject: '【送出機関】中国技能実習生受入れ先紹介のご依頼（謝礼20万円）',
        content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>ご担当者様<br>
                    平素より大変お世話になっております。<br>
                    中国送出機関【福州亜麟創新科技有限公司】でございます。<br>
                    このたび、提携先ネットワークを広げたく、監理団体様および受入企業様を対象に、「ご紹介1名につき20万円の謝礼制度」 を開始いたしました。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://yalin.asia" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/yalin-content-2026-3-16.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
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
                  <span style="font-size:17px; font-weight: bold;">福州亜麟創新科技有限公司（日本事務所）</span><br>
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
        description: 'Yalin 2026 テンプレート (オプション ①)',
        category: 'promotion'
    },
    {
        id: 'yalin-v2',
        name: 'Yalin (Option 2)',
        subject: '【送出機関】中国技能実習生受入れ先紹介のご依頼（謝礼20万円）',
        content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>ご担当者様<br>
                    平素より格別のご高配を賜り、誠にありがとうございます。<br>
                    中国の送出機関【福州亜麟創新科技有限公司】でございます。<br><br>
                    このたび、提携先ネットワークを広げたく、監理団体様・受入企业様を対象に、「ご紹介1名につき20万円の謝礼制度」 をご用意いたしました。<br>
                    今後もより良いパートナーとしてお役に立てれば幸いです。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://yalin.asia" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/yalin-content-2026-3-16.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
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
                  <span style="font-size:17px; font-weight: bold;">福州亜麟創新科技有限公司（日本事務所）</span><br>
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
        description: 'Yalin 2026 テンプレート (オプション ②)',
        category: 'promotion'
    },
    {
        id: 'yalin-v3',
        name: 'Yalin (Option 3)',
        subject: '【送出機関】中国技能実習生受入れ先紹介のご依頼（謝礼20万円）',
        content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
 <!-- Header/Intro Text -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto;">
            <tr>
                <td style="font-size: 16px; line-height: 1.8; color: #333333; padding: 20px;">
                    <p>ご担当者様<br>
                    いつもお世話になっております。<br>
                    中国送出機関【福州亜麟創新科技有限公司】です。<br><br>
                    このたび、提携先ネットワークを広げたく、监理団体様・受入企业様向けに「1名ご紹介につき20万円の謝礼制度」 をスタートいたしました。<br>
                    ぜひこの機会にご活用いただければ幸いです。</p>
                </td>
            </tr>
        </table>
        <!-- Main Image -->
        <a href="https://yalin.asia" target="_blank">
        <div style="max-width: 750px; margin: 0 auto; margin-bottom: 20px;">
          <img src="https://email-test-black.vercel.app/yalin-content-2026-3-16.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
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
                  <span style="font-size:17px; font-weight: bold;">福州亜麟創新科技有限公司（日本事務所）</span><br>
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
        description: 'Yalin 2026 テンプレート (オプション ③)',
        category: 'promotion'
    }
];