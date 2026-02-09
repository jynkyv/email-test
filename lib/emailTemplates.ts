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
    id: 'db',
    name: '募集中！',
    subject: '【募集中！】ビジネスパートナー(代理)共同創業者募集※このメールは返信可能です',
    content: ` <div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Kaku Gothic ProN','Noto Sans JP',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
    <div style="max-width: 750px; margin: 0 auto;">
      <a href="https://www.familyorjp.com/"><img src="https://email-test-black.vercel.app/family-hero-3.jpg" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/></a>
      <table role="presentation" align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
        <tr>
        <td align="left" style="padding:0; ">
          <div style="width:750px;color: #000000;font-size: 18px;max-width:750px;margin:0 auto; margin-bottom:1vh;">ビジネスパートナー(代理)と共同創業者募集中<br>
            当社では、技能実習生の受け入れ企業をご紹介いただける<br>
            ビジネスパートナー(代理)を募集しております。
          </div>
          </td>
      </tr>
      </table>
      <a href="https://www.familyorjp.com/"><img src="https://email-test-black.vercel.app/family-content-1.jpg" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top; margin-bottom:1vh;"/></a>
      <table role="presentation" align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
        <tr>
        <td align="left" style="padding:0; ">
          <div style="width:750px;color: #000000;font-size: 18px;max-width:750px;margin:0 auto; line-height: 2;">※1報酬体系について<br>
            ご紹介いただいた企業が技能実習生を受け入れる人数に応じて、
            報酬をお支払いします。<br>
            例：１社が技能実習生３名を受け入れる場合、代理の方には（60万円）の
            報酬をお支払いし<br>ます。（1名あたり、20万円）<br>
            ※2継続的な報酬獲得が可能<br>
            ご紹介いただいた企業と代理の方は「継続的な提携関係」となります。<br>
            例：今年３名の受け入れがあった企業が、翌年も３名を受け入れる場合
            翌年も同様に代理の方に報酬（60万円）をお支払いします。<br>
            ※3代理紹介制度について 代理Aが、技能実習生を受け入れる企業Bを当<br>
            社に紹介した場合： 企業Bが技能実習生1名あたり（20万円）の紹介報酬
            を紹介元Aに<br>お支払いします。 紹介された企業Bが別の企業を当社へ
紹介し、技能実習生の採用に至った場合、 Bにも技能実習生１名あたり
（20万円）の紹介報酬をお支払いします。 この制度により、<br>ネット
ワークを広げることで双方に利益が生まれます。<br>
<div style="height: 20px;width: 20px;"></div>
            求めるパートナー像<br>
            ●技能実習制度に理解のある方<br>
            ●企業とのネットワークをお持ちの方<br>
            ●長期的な協力関係を築ける方<br>
            ●紹介活動に意欲的な方
          </div>
          </td>
      </tr>
      </table>
      <div style="display: block;">
        <a href="https://www.familyorjp.com/">
        <img src="https://email-test-black.vercel.app/family-detail-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
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
              <img src="https://email-test-black.vercel.app/ag-qr-right-1.png" style="width: 100%; max-width: 200px; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
            </a>
          </td>
        </tr>
      </table>
      <div style="display: block;">
        <img src="https://email-test-black.vercel.app/ag-footer-1.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
      </div>
    </div>
    </div>
`,
    description: '完全な HTML 構造と画像が含まれるデフォルトの電子メール テンプレートを使用します。',
    category: 'default'
  },
  {
    id: 'ag',
    name: 'AG',
    subject: 'Family協同組合ーー外国人材採用初期費用減免',
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
        <img src="https://email-test-black.vercel.app/qilin.png" style="width: 100%; display: block; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
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
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');

        body {
            font-family: 'Noto Sans JP', sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .container {
            width: 800px;
            background-color: white;
            padding: 30px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
        }

        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 10px;
        }

        .logo-area {
            color: #00569d;
            font-weight: bold;
            font-size: 24px;
            line-height: 1.2;
        }

        .logo-text {
            font-size: 28px;
            color: #2c5a94;
        }

        .sub-note {
            font-size: 12px;
            color: #d32f2f;
            font-weight: bold;
            margin-top: 5px;
        }

        .main-title {
            font-size: 42px;
            color: #00569d;
            font-weight: 900;
            font-style: italic;
            text-align: right;
            letter-spacing: -2px;
        }

        /* Table Styles */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            /* Critical for controlling border overlap manually */
            margin-bottom: 15px;
        }

        th,
        td {
            padding: 10px 5px;
            text-align: center;
            vertical-align: middle;
            font-size: 15px;
        }

        /* Column 1: Items */
        .col-item {
            background-color: #dcecf6;
            color: #00569d;
            font-weight: bold;
            width: 20%;
            border-bottom: 2px solid #fff;
            text-align: left;
            padding-left: 15px;
        }

        /* Column 2: Others */
        .col-other {
            background-color: #fcfcfc;
            width: 25%;
            border-bottom: 1px solid #ccc;
            position: relative;
        }

        .price-wrap {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            font-weight: bold;
            color: #555;
        }

        .tax-note {
            font-size: 9px;
            writing-mode: vertical-rl;
            margin-left: 5px;
            color: #555;
            font-weight: normal;
            height: 35px;
        }

        /* Column 3: Family (Blue Column) */
        .col-family {
            border-left: 3px solid #00569d;
            border-right: 3px solid #00569d;
            border-bottom: 1px solid #ccc;
            color: #00569d;
            font-weight: 900;
            font-size: 22px;
            width: 18%;
            background-color: #fff;
        }

        /* Header for Family */
        th.col-family {
            background-color: #00569d;
            color: white;
            border: 3px solid #00569d;
            /* Full thick border */
            font-size: 18px;
        }

        /* Column 4: Reason (UPDATED LOGIC) */
        .col-reason {
            width: 37%;
            /* BORDER IS NOW DIRECTLY ON THE TD */
            border-top: 2px solid #00569d;
            border-right: 2px solid #00569d;
            border-bottom: 2px solid #00569d;
            /* No left border because Family col has a right border. 
           But visually we might want a double line effect or just single? 
           Image looks like single thick line. Let's stick to right/top/bottom here. */

            background-color: #fff;
            color: #00569d;
            font-weight: bold;
            font-size: 14px;
            padding: 5px 10px;
        }

        /* Header for Reason (FIXED TOP ALIGNMENT) */
        th.col-reason {
            background-color: #00569d;
            color: white;
            font-size: 18px;
            /* Match the Family header border thickness exactly */
            border-top: 3px solid #00569d;
            border-right: 3px solid #00569d;
            border-bottom: 3px solid #00569d;
            border-left: none;
            /* Rely on Family's right border */
        }

        /* Content Alignment Helpers */
        .reason-content {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: left;
            min-height: 40px;
            width: 100%;
        }

        .center-text {
            text-align: center;
            width: 100%;
        }

        /* Header Row Specifics */
        thead th:first-child {
            background-color: #dcecf6;
            color: #00569d;
        }

        thead th:nth-child(2) {
            color: #555;
            border-bottom: 1px solid #ccc;
        }

        /* Total Row Specifics */
        tr.total-row .col-item {
            background-color: #dcecf6;
            /* Keep background */
            border-bottom: none;
        }

        tr.total-row .col-other {
            border-bottom: 1px solid #ccc;
        }

        tr.total-row .col-family {
            border-bottom: 3px solid #00569d;
            /* Close bottom of Family box */
        }

        /* FIX: The last cell now uses the standard class but with special content styling */
        tr.total-row .col-reason {
            border-bottom: 2px solid #00569d;
            /* Ensure bottom closes */
            padding: 0;
            /* Remove padding to let inner box fill if needed, or use padding */
            vertical-align: middle;
        }

        /* Limited Time Text Styling */
        .limited-text {
            color: #d32f2f;
            font-weight: 900;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
        }

        .limited-ref {
            font-size: 12px;
            margin-left: 5px;
            transform: translateY(-5px);
            color: #d32f2f;
        }

        .small-ref {
            font-size: 10px;
            color: #d32f2f;
            position: absolute;
            bottom: 2px;
            right: 2px;
            line-height: 1;
            font-weight: bold;
        }

        /* Notes & Text */
        .notes-red {
            color: #d32f2f;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .text-body {
            font-size: 11px;
            line-height: 1.6;
            color: #000;
        }

        .text-section {
            margin-bottom: 15px;
        }

        .section-title {
            color: #00569d;
            font-weight: bold;
            display: flex;
            align-items: center;
            font-size: 12px;
            margin-bottom: 2px;
        }

        .section-title::before {
            content: "●";
            color: #00569d;
            margin-right: 5px;
            font-size: 14px;
        }
    </style>

    <div class="container">
        <div class="header">
            <div class="logo-area">
                <span style="font-size: 24px; color: #00A0E9;">●</span><span
                    style="font-size: 24px; color: #E60012; margin-left: -8px;">▮</span>
                <span class="logo-text">Family協同組合</span>
                <div class="sub-note">◎受入れ後費用概算（１名あたり）</div>
            </div>
            <div class="main-title">採用初期費用減免</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="col-item">初期費用項目</th>
                    <th class="col-other">他社</th>
                    <th class="col-family">Family協同組合</th>
                    <th class="col-reason">減免の理由</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="col-item">技能実習計画認定<br>申請手数料</td>
                    <td class="col-other">
                        <div class="price-wrap">3,900円<span class="tax-note">(非課税)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content center-text">当組合が負担</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">在留資格認定証明書<br>交付申請手続代行費用</td>
                    <td class="col-other">
                        <div class="price-wrap">55,000円<span class="tax-note">(税別)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content">経験豊富なスタッフが<br>ビザ申請をサポート</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">入国渡航費</td>
                    <td class="col-other">
                        <div class="price-wrap">77,000円<span class="tax-note">(非課税)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content center-text">当組合が負担</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">入国前講習費</td>
                    <td class="col-other">
                        <div class="price-wrap">15,000円<span class="tax-note">(非課税)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content">実績のある送出機関での<br>講習を実施</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">入国後講習費</td>
                    <td class="col-other">
                        <div class="price-wrap">110,000円<span class="tax-note">(税別)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content">当組合の講習センターで<br>講習を実施</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">実習生への<br>講習手当</td>
                    <td class="col-other">
                        <div class="price-wrap">60,000円<span class="tax-note">(非課税)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content center-text">当組合が負担</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">健康診断</td>
                    <td class="col-other">
                        <div class="price-wrap">11,000円<span class="tax-note">(税別)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content center-text">当組合が負担</div>
                    </td>
                </tr>
                <tr>
                    <td class="col-item">国内人件費<br>経費等</td>
                    <td class="col-other">
                        <div class="price-wrap">77,000円<span class="tax-note">(税別)</span></div>
                    </td>
                    <td class="col-family">減免</td>
                    <td class="col-reason">
                        <div class="reason-content center-text">アプリで一元管理</div>
                    </td>
                </tr>
                <tr class="total-row">
                    <td class="col-item">合計</td>
                    <td class="col-other">
                        <div class="price-wrap">408,900円<span class="tax-note">(税別)</span></div>
                    </td>
                    <td class="col-family">
                        減免
                        <div class="small-ref">※2<br>※3</div>
                    </td>
                    <td class="col-reason">
                        <div class="limited-text">期間限定 <span class="limited-ref">※1</span></div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="notes-red">
            ※1 期間限定（2025年9月1日～2026年12月31日） ※2 組合加入費別途 ※3 入国までの初期費用完全0円
        </div>

        <div class="text-body">
            <div class="text-section">
                <div class="section-title">期間限定の段階的な措置</div>
                1. 初期費用の減免は、制度開始当初に限定した「段階的な措置」として導入したものです。<br>
                あくまで特別対応であり、継続的な恒久措置ではありません。<br>
                2. 減免の目的は中小企業の負担軽減と透明性の確保、中小企業の皆様が抱える人材確保におけるコスト負担を軽減することにあります。<br>
                さらに、当組合が提供する専用アプリの活用により、海外の実習生は企業が発信する求人情報を直接確認できるようになっています。<br>
                そのため、これまで一部の送出機関において発生していた、虚偽の情報や誤解を招く宣伝行為を防止し、実習生と企業の双方にとって透明で公平な採用プロセスを実現いたします。
            </div>

            <div class="text-section">
                <div class="section-title">監理団体としての社会的責任</div>
                当組合は監理団体として、技能実習制度の適正運営を通じて公正で健全な雇用環境の確保に努めています。<br>
                企業と実習生の双方が安心して制度を活用できるよう常に社会的責任を自覚し、高い倫理観をもって行動してまいります。
            </div>

            <div class="text-section">
                <div class="section-title">コンプライアンスの遵守</div>
                当組合は、日本の関連法令および技能実習制度に関する各種ガイドラインを厳格に遵守いたします。<br>
                また、内部統制を強化し、定期的な監査や自己点検を通じて、不正防止・透明性の確保・説明責任の徹底を実現いたします。<br>
                これにより、受入企業・実習生・関係機関のすべてに対して、信頼できる監理団体であり続けることをお約束いたします。
            </div>

            <div class="text-section">
                <div class="section-title">今後の方針</div>
                当組合は、監理団体としての責務を果たしつつ、技能実習制度を健全かつ公正に運営してまいります。<br>
                中小企業支援と実習生の安心確保を両立させ、<br>
                「信頼」「透明性」「法令遵守」を基盤とした組織運営を今後も推進いたします。
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

  {
    id: 'db-footer-1',
    name: '一部-页脚',
    subject: '',
    content: `<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
  <tr>
    <td align="center" style="padding:0;">
      <div style="text-align:left;width:750px;background-color:#0000; color:#000000; padding:20px 30px; font-size:14px; border-radius:8px;">
        <p style="margin:0 0 10px 0;">お問い合わせもお気軽にどうぞ。<br>
          ※このメールは返信可能です※
        </p>
        <p style="margin:0 0 10px 0;">
          <span style="font-size:18px">Family協同組合</span><br>
          担当: 菅原 　日本語・中国語対応<br>
          TEL：029-886-8181<br>
          Mobile：080-7141-7987<br>
          E-mail: <a href="mailto:sugawararina@hotmail.com" style="color:#0056b3; text-decoration:none;">sugawararina@hotmail.com</a>
        </p>
        <p style="margin:0 0 10px 0;">〒300-0043<br>
          茨城県土浦市中央1-1-26　AGビル</p>
        <p style="margin:0;">© 2025 Family協同組合 All Rights Reserved.</p>
      </div>
    </td>
  </tr>
</table>`,
    description: '',
    category: 'footer'
  }
]; 