import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSingleEmail } from '@/lib/sendgrid';

// 处理邮件队列
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');
    
    // 获取用户信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      );
    }

    // 只有管理员可以处理队列
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 首先清理长时间处于处理中状态的邮件（超过5分钟）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from('email_queue')
      .update({ 
        status: 'pending',
        processed_at: null
      })
      .eq('status', 'processing')
      .lt('processed_at', fiveMinutesAgo);

    // 获取待处理的邮件（处理所有待处理邮件，不限制数量）
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('retry_count', 3)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('获取待处理邮件失败:', fetchError);
      return NextResponse.json(
        { error: '获取待处理邮件失败' },
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有待处理的邮件',
        processed: 0
      });
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    // 用于统计每个申请人的发送情况
    const applicantStats = new Map<string, { sendCount: number, recipientCount: number }>();

    // 在处理邮件前，先检查是否已经发送过
    for (const email of pendingEmails) {
      try {
        // 检查是否已经发送过相同的邮件
        const contentHash = require('crypto').createHash('md5').update(email.content).digest('hex');
        
        const { data: existingEmail } = await supabase
          .from('customer_emails')
          .select('id')
          .eq('to_email', email.recipient)
          .eq('subject', email.subject)
          .eq('content_hash', contentHash)
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .single();

        if (existingEmail) {
          console.log('邮件已发送过，跳过重复发送:', { recipient: email.recipient, subject: email.subject });
          
          // 更新队列状态为已发送
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);
          
          continue; // 跳过这个邮件
        }

        // 更新状态为处理中
        await supabase
          .from('email_queue')
          .update({ 
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // 直接发送邮件
        try {
          const result = await sendSingleEmail(email.recipient, email.subject, email.content);
          
          // 记录发送的邮件到customer_emails表
          const applicantId = await recordSentEmail(email.recipient, email.subject, email.content, email.approval_id, result.id);
          
          // 统计申请人的发送情况
          if (applicantId) {
            if (!applicantStats.has(applicantId)) {
              applicantStats.set(applicantId, { sendCount: 0, recipientCount: 0 });
            }
            const stats = applicantStats.get(applicantId)!;
            stats.recipientCount += 1; // 每个成功发送的邮件，收件人数+1
          }
          
          // 发送成功
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);

          successCount++;
          results.push({
            id: email.id,
            recipient: email.recipient,
            success: true,
            messageId: result.id
          });
        } catch (sendError) {
          // 发送失败
          const errorMessage = sendError instanceof Error ? sendError.message : '未知错误';
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: errorMessage,
              retry_count: email.retry_count + 1,
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);

          failCount++;
          results.push({
            id: email.id,
            recipient: email.recipient,
            success: false,
            error: errorMessage
          });
        }
      } catch (error) {
        console.error(`处理邮件 ${email.id} 失败:`, error);
        
        // 确保邮件状态被正确更新，避免卡在处理中状态
        try {
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed',
              error_message: '处理过程中发生异常',
              retry_count: email.retry_count + 1,
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);
        } catch (updateError) {
          console.error(`更新邮件 ${email.id} 状态失败:`, updateError);
        }
        
        failCount++;
        results.push({
          id: email.id,
          recipient: email.recipient,
          success: false,
          error: '处理失败'
        });
      }
    }

    // 注意：邮件统计数据通过实时查询 email_approvals 表计算，无需手动更新
    // email_send_count 和 email_recipient_count 字段会自动计算

    // 检查是否还有待处理的邮件，如果有则继续处理
    const { data: remainingEmails } = await supabase
      .from('email_queue')
      .select('id')
      .eq('status', 'pending')
      .lte('retry_count', 3);

    const hasRemaining = remainingEmails && remainingEmails.length > 0;

    return NextResponse.json({
      success: true,
      message: `处理完成。成功: ${successCount}, 失败: ${failCount}`,
      results,
      processed: successCount + failCount,
      hasRemaining,
      remainingCount: hasRemaining ? remainingEmails.length : 0
    });

  } catch (error) {
    console.error('处理邮件队列失败:', error);
    return NextResponse.json(
      { error: '处理邮件队列失败' },
      { status: 500 }
    );
  }
}

// 记录发送的邮件到customer_emails表
async function recordSentEmail(toEmail: string, subject: string, content: string, approvalId: string, messageId: string): Promise<string | null> {
  try {
    // 查找对应的客户
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', toEmail)
      .single();

    if (customerError || !customer) {
      console.log('收件人不是客户，跳过记录:', toEmail);
      return null;
    }

    // 修改重复检查逻辑：基于客户ID、收件人、主题和内容哈希
    const contentHash = require('crypto').createHash('md5').update(content).digest('hex');
    
    const { data: existingRecord } = await supabase
      .from('customer_emails')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('to_email', toEmail)
      .eq('subject', subject)
      .eq('content_hash', contentHash) // 新增内容哈希字段
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5分钟内的记录
      .single();

    if (existingRecord) {
      console.log('邮件记录已存在，跳过重复插入:', { customerId: customer.id, toEmail, subject });
      return null;
    }

    // 获取审核申请信息以获取申请人ID
    const { data: approval, error: approvalError } = await supabase
      .from('email_approvals')
      .select('applicant_id')
      .eq('id', approvalId)
      .single();

    if (approvalError || !approval) {
      console.error('获取审核申请信息失败:', approvalError);
      return null;
    }

    // 获取发送者的邮箱
    const { data: senderUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', approval.applicant_id)
      .single();

    const fromEmail = senderUser?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';

    // 插入发送的邮件记录
    const { error: insertError } = await supabase
      .from('customer_emails')
      .insert({
        customer_id: customer.id,
        from_email: fromEmail,
        to_email: toEmail,
        subject: subject || '无主题',
        content: content || '',
        content_hash: contentHash, // 新增内容哈希
        message_id: messageId,
        is_read: true,
        direction: 'outbound'
      });

    if (insertError) {
      console.error('记录发送邮件失败:', insertError);
    } else {
      console.log('✅ 发送邮件记录成功:', { customerId: customer.id, toEmail, messageId });
    }

    return approval.applicant_id;
  } catch (error) {
    console.error('记录发送邮件时出错:', error);
    return null;
  }
}

 