-- ==========================================
-- 批量将客户加入到 Family 2026 模版审核队列脚本
-- ==========================================

DO $$
DECLARE
    v_admin_id UUID;
    v_subject TEXT := 'Family協同組合——外国人材採用初期費用減免';
    v_content TEXT := '<div style="margin:0;font-family:-apple-system,BlinkMacSystemFont,''Hiragino Kaku Gothic ProN'',''Noto Sans JP'',Meiryo,Segoe UI,Arial,sans-serif;color:#1a1a1a;padding:0;width:100%;background-color:#ffffff;min-height:100vh;font-size:16px;">
  <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
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
        <!-- Footer -->
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; margin:0; padding:0; -webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; width:100%;">
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

    RAISE NOTICE '[Family 2026] 处理完成！共分配了 % 个客户到待审核队列中', v_total_processed;
END $$;
