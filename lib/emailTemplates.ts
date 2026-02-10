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
        id: 'family',
        name: 'Family',
        subject: 'Family協同組合ーー外国人材採用初期費用減免',
        content: `<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="center" style="padding:0; ">
        <div style="max-width: 750px; margin: 0 auto;">
          <a href="https://www.familyorjp.com/"><img src="https://email-test-black.vercel.app/family-hero-2026.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/></a>
        </div>
      </td>
    </tr>
</table>

    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: 0 auto;">
            <tr>
                <td style="padding: 0;">
                    

                    <div style="display: block; margin-bottom: 15px;">
                        <img src="https://email-test-black.vercel.app/family-content-2026.png" style="width: 100%; display: block; border: 0; height: auto; outline: none; text-decoration: none;">
                    </div>
                </td>
            </tr>
        </table>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: 0 auto;">
            <tr>
                <td>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 15px;">
                        <thead>
                            <tr>
                                <th width="20%" style="background-color: #dcecf6; color: #00569d; font-size: 16px; font-weight: bold; padding: 15px 10px; border-bottom: 2px solid #ffffff; text-align: center;">
                                    初期費用項目
                                </th>
                                <th width="25%" style="background-color: #ffffff; color: #555555; font-size: 16px; font-weight: bold; padding: 15px 10px; border-bottom: 1px solid #cccccc; text-align: center;">
                                    他社
                                </th>
                                <th width="20%" style="background-color: #00569d; color: #ffffff; font-size: 17px; font-weight: bold; padding: 15px 10px; border: 3px solid #00569d; text-align: center;">
                                    Family協同組合
                                </th>
                                <th width="35%" style="background-color: #00569d; color: #ffffff; font-size: 18px; font-weight: bold; padding: 15px 10px; border-top: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 3px solid #00569d; text-align: center;">
                                    減免の理由
                                </th>
                            </tr>
                        </thead>
                        

                        <tbody>
                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    技能実習計画認定<br>申請手数料
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    3,900円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(非<br>課<br>税)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    当組合が負担
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    在留資格認定証明書<br>交付申請手続代行費用
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    55,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(税<br>別)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    経験豊富なスタッフが<br>ビザ申請をサポート
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    入国渡航費
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    77,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(非<br>課<br>税)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    当組合が負担
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    入国前講習費
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    15,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(非<br>課<br>税)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    実績のある送出機関での<br>講習を実施
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    入国後講習費
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    110,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(税<br>別)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    当組合の講習センターで<br>講習を実施
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    実習生への<br>講習手当
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    60,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(非<br>課<br>税)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    当組合が負担
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    健康診断
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    11,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(税<br>別)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    当組合が負担
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 5px; border-bottom: 2px solid #ffffff; font-size: 15px;">
                                    国内人件費<br>経費等
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: bold; font-size: 20px;">
                                    77,000円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(税<br>別)</span>
                                </td>
                                <td align="center" style="color: #00569d; font-weight: 900; font-size: 22px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 1px solid #cccccc;">
                                    減免
                                </td>
                                <td align="center" style="color: #00569d; font-weight: bold; font-size: 14px; border: 2px solid #00569d; padding: 5px;">
                                    アプリで一元管理
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #dcecf6; color: #00569d; font-weight: bold; padding: 10px 0; font-size: 15px;">
                                    合計
                                </td>
                                <td align="center" style="background-color: #fcfcfc; border-bottom: 1px solid #cccccc; color: #555555; font-weight: 900; font-size: 24px;">
                                    408,900円
                                    <span style="font-size: 10px; font-weight: normal; vertical-align: middle; display: inline-block; line-height: 1.1; margin-left: 3px;">(税<br>別)</span>
                                </td>
                                <td align="center" style="position: relative; color: #00569d; font-weight: 900; font-size: 24px; border-left: 3px solid #00569d; border-right: 3px solid #00569d; border-bottom: 3px solid #00569d;">
                                    減免
                                    <div style="font-size: 10px; color: #d32f2f; line-height: 1; font-weight: bold; position: absolute; right: 2px; bottom: 2px;">※2<br>※3</div>
                                </td>
                                <td align="center" style="color: #d32f2f; font-weight: 900; font-size: 20px; border: 2px solid #00569d; padding: 5px; background-color: #ffffff;">
                                    期間限定 <span style="font-size: 12px; vertical-align: top;">※1</span>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <div style="color: #d32f2f; font-weight: bold; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
                        ※1 期間限定（2025年9月1日～2026年12月31日） ※2 組合加入費別途 ※3 入国までの初期費用完全0円
                    </div>


                    <style>
                        @media only screen and (max-width: 600px) {
                            .mobile-text {
                                font-size: 24px !important;
                                line-height: 1.6 !important;
                            }
                            .mobile-title {
                                font-size: 28px !important;
                                margin-bottom: 5px !important;
                            }
                            .mobile-container {
                                width: 100% !important;
                            }
                        }
                    </style>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mobile-text" style="font-size: clamp(18px, 3vw, 24px); line-height: 1.6; color: #000000;">
                        <tr>
                            <td style="padding-bottom: 15px;">
                                <div class="mobile-title" style="color: #00569d; font-weight: bold; font-size: clamp(22px, 4vw, 30px); margin-bottom: 2px;">
                                    <span style="font-size: clamp(18px, 3vw, 24px);">●</span> 期間限定の段階的な措置
                                </div>
                                1. 初期費用の減免は、制度開始当初に限定した「段階的な措置」として導入したものです。<br>
                                あくまで特別対応であり、継続的な恒久措置ではありません。<br>
                                2. 減免の目的は中小企業の負担軽減と透明性の確保、中小企業の皆様が抱える人材確保におけるコスト負担を軽減することにあります。<br>
                                さらに、当組合が提供する専用アプリの活用により、海外の実習生は企業が発信する求人情報を直接確認できるようになっています。<br>
                                そのため、これまで一部の送出機関において発生していた、虚偽の情報や誤解を招く宣伝行為を防止し、実習生と企業の双方にとって透明で公平な採用プロセスを実現いたします。
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 15px;">
                                <div class="mobile-title" style="color: #00569d; font-weight: bold; font-size: clamp(22px, 4vw, 30px); margin-bottom: 2px;">
                                    <span style="font-size: clamp(18px, 3vw, 24px);">●</span> 監理団体としての社会的責任
                                </div>
                                当組合は監理団体として、技能実習制度の適正運営を通じて公正で健全な雇用環境の確保に努めています。<br>
                                企業と実習生の双方が安心して制度を活用できるよう常に社会的責任を自覚し、高い倫理観をもって行動してまいります。
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 15px;">
                                <div class="mobile-title" style="color: #00569d; font-weight: bold; font-size: clamp(22px, 4vw, 30px); margin-bottom: 2px;">
                                    <span style="font-size: clamp(18px, 3vw, 24px);">●</span> コンプライアンスの遵守
                                </div>
                                当組合は、日本の関連法令および技能実習制度に関する各種ガイドラインを厳格に遵守いたします。<br>
                                また、内部統制を強化し、定期的な監査や自己点検を通じて、不正防止・透明性の確保・説明責任の徹底を実現いたします。<br>
                                これにより、受入企業・実習生・関係機関のすべてに対して、信頼できる監理団体であり続けることをお約束いたします。
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="mobile-title" style="color: #00569d; font-weight: bold; font-size: clamp(22px, 4vw, 30px); margin-bottom: 2px;">
                                    <span style="font-size: clamp(18px, 3vw, 24px);">●</span> 今後の方針
                                </div>
                                当組合は、監理団体としての責務を果たしつつ、技能実習制度を健全かつ公正に運営してまいります。<br>
                                中小企業支援と実習生の安心確保を両立させ、<br>
                                「信頼」「透明性」「法令遵守」を基盤とした組織運営を今後も推進いたします。
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </center>
<br>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
<tr>
  <td align="center" style="padding:0; ">
    <div style="font-size:20px;font-weight:bold;color:#000000;text-align:center;">もしご興味がございましたら、資料の送付も可能です。<br>
何卒ご検討のほど、よろしくお願い申し上げます。</div>
  </td>
</tr>
<tr>
  <td align="center" style="padding:0; ">
    <div style="border: none;width: 90%; max-width: 750px; height: 3px; background-color: #000000; margin: 20px 0;"></div>
  </td>
</tr>
</table>

    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; max-width: 800px; margin: 0 auto; margin-top: 10px;">
            <tr>
                <td align="center">
                    <div style="display: block;">
                        <a href="https://www.familyorjp.com/">
                            <img src="https://email-test-black.vercel.app/family-detail-2026.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                        </a>
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tr>
                            <td style="width: 50%; text-align: center;">
                                <img src="https://email-test-black.vercel.app/ag-qr-left-1.png" style="width: 100%; max-width: 400px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                            </td>
                            <td style="width: 25%; text-align: center;">
                                <a href="https://apps.apple.com/jp/app/open%E5%AE%9F%E7%BF%92%E7%94%9F/id6746228965" target="_blank">
                                    <img src="https://email-test-black.vercel.app/ag-qr-middle-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                                </a>
                            </td>
                            <td style="width: 25%; text-align: center;">
                                <a href="https://www.pgyer.com/Lxoo9K6Q" target="_blank">
                                    <img src="https://email-test-black.vercel.app/ag-qr-right-2.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                                </a>
                            </td>
                        </tr>
                    </table>
                    <div style="display: block;">
                        <img src="https://email-test-black.vercel.app/ag-footer-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
                    </div>
                </td>
            </tr>
        </table>
    </center><table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:100%;max-width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※
        </p>
        <p style="margin:0 0 10px 0;">
          <span style="font-size:17px">Family協同組合</span><br>
          担当: 菅原 　日本語・中国語対応<br>
          TEL：029-886-8181<br>
          Mobile：080-7141-7987<br>
          E-mail: <a href="mailto:family.organization.jp@gmail.com" style="color:#0056b3; text-decoration:none;">family.organization.jp@gmail.com</a>
        </p>
        <p style="margin:0 0 10px 0;">〒300-0043<br>
          茨城県土浦市中央1-1-26　AGビル</p>
        <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
        description: '完全な HTML 構造と画像が含まれるデフォルトの電子メール テンプレートを使用します。',
        category: 'default'
    }
];