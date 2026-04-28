-- ==========================================
-- 批量将客户加入到 Yalin 2026 模版审核队列脚本
-- ==========================================

DO $$
DECLARE
    v_admin_id UUID;
    v_subject TEXT := '【送出機関】中国技能実習生受入れ先紹介のご依頼（謝礼20万円）';
    v_content TEXT := '<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,''Hiragino Kaku Gothic ProN'',''Noto Sans JP'',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
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
          <img src="https://email-test-black.vercel.app/yalin-hero-4-27.png" alt="" style="width:100%; display: block; margin: 0; padding: 0; border: 0; vertical-align: top;"/>
        </div>
        </a>
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
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
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
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
</div>';

    v_recipients JSONB;
    v_batch_size INT := 50;
    v_offset INT := 0;
    v_total_processed INT := 0;
BEGIN
    -- 1. 获取一个管理员ID
    SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION '未找到管理员账号，无法创建申请记录';
    END IF;

    -- 2. 循环将拥有有效邮箱的客户分批处理
    LOOP
        SELECT jsonb_agg(email) INTO v_recipients
        FROM (
            SELECT email
            FROM customers
            WHERE email IS NOT NULL
              AND email != ''
              AND (unsubscribe IS NULL OR unsubscribe = false)
            ORDER BY id
            LIMIT v_batch_size
            OFFSET v_offset
        ) sub;

        EXIT WHEN v_recipients IS NULL OR jsonb_array_length(v_recipients) = 0;

        -- 3. 插入到审核表中
        INSERT INTO email_approvals (
            applicant_id,
            subject,
            content,
            recipients,
            status,
            created_at
        ) VALUES (
            v_admin_id,
            v_subject,
            v_content,
            v_recipients,
            'pending',
            NOW()
        );

        v_offset := v_offset + v_batch_size;
        v_total_processed := v_total_processed + jsonb_array_length(v_recipients);
    END LOOP;

    RAISE NOTICE '[Yalin 2026] 处理完成！共分配了 % 个客户到待审核队列中', v_total_processed;
END $$;
