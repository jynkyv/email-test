import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSingleEmail } from '@/lib/sendgrid';

// 批量自动审核API - 专门用于后台自动处理
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

    // 只有管理员可以执行自动审核
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    // 获取最早的待审核申请
    const { data: pendingApprovals, error: fetchError } = await supabase
      .from('email_approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error('获取待审核申请失败:', fetchError);
      return NextResponse.json(
        { error: '获取待审核申请失败' },
        { status: 500 }
      );
    }

    if (!pendingApprovals || pendingApprovals.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有待审核的申请',
        processed: 0
      });
    }

    const approval = pendingApprovals[0];
    console.log(`🚀 自动审核处理申请: ${approval.id}`);

    // 更新审核状态为已通过
    const { error: updateError } = await supabase
      .from('email_approvals')
      .update({
        status: 'approved',
        approver_id: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', approval.id);

    if (updateError) {
      console.error('更新审核状态失败:', updateError);
      return NextResponse.json(
        { error: '更新审核状态失败' },
        { status: 500 }
      );
    }

    // 添加邮件到队列
    const queueItems = approval.recipients.map((recipient: string) => ({
      recipient,
      subject: approval.subject,
      content: approval.content,
      approval_id: approval.id,
      status: 'pending',
      retry_count: 0
    }));

    const { error: queueError } = await supabase
      .from('email_queue')
      .insert(queueItems);

    if (queueError) {
      console.error('添加邮件到队列失败:', queueError);
      return NextResponse.json(
        { error: '添加邮件到队列失败' },
        { status: 500 }
      );
    }

    // 立即处理队列
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;

    // 获取刚添加的队列项目
    const { data: queueEmails, error: queueFetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('approval_id', approval.id)
      .eq('status', 'pending');

    if (!queueFetchError && queueEmails) {
      for (const email of queueEmails) {
        try {
          // 更新状态为处理中
          await supabase
            .from('email_queue')
            .update({ 
              status: 'processing',
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);

          // 发送邮件
          try {
            const result = await sendSingleEmail(email.recipient, email.subject, email.content);
            
            // 记录发送的邮件
            await recordSentEmail(email.recipient, email.subject, email.content, approval.id, result.id);
            
            // 发送成功
            await supabase
              .from('email_queue')
              .update({ 
                status: 'sent',
                processed_at: new Date().toISOString()
              })
              .eq('id', email.id);

            successCount++;
            console.log(`✅ 邮件发送成功: ${email.recipient}`);
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
            console.log(`❌ 邮件发送失败: ${email.recipient} - ${errorMessage}`);
          }
        } catch (error) {
          console.error(`处理邮件 ${email.id} 失败:`, error);
          
          // 确保邮件状态被正确更新
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
        }
        
        processedCount++;
      }
    }

    // 更新申请人的发送统计
    if (successCount > 0) {
      try {
        await updateUserEmailStats(approval.applicant_id, 1, successCount);
      } catch (statsError) {
        console.error(`更新申请人 ${approval.applicant_id} 统计失败:`, statsError);
      }
    }

    console.log(`�� 自动审核完成: 申请 ${approval.id}, 处理 ${processedCount} 个邮件，成功 ${successCount}，失败 ${failCount}`);

    return NextResponse.json({
      success: true,
      message: '自动审核完成',
      processed: 1,
      approvalId: approval.id,
      emailStats: {
        total: processedCount,
        success: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('自动审核失败:', error);
    return NextResponse.json(
      { error: '自动审核失败' },
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

// 更新用户邮件发送统计
async function updateUserEmailStats(userId: string, sendCount: number, recipientCount: number) {
  try {
    // 使用原始SQL查询来更新计数器
    const { error } = await supabase.rpc('update_user_email_stats', {
      user_id: userId,
      send_count: sendCount,
      recipient_count: recipientCount
    });

    if (error) {
      console.error('更新用户邮件统计失败:', error);
      throw error;
    }

    console.log(`✅ 用户 ${userId} 邮件统计更新成功: 发送次数+${sendCount}, 收件人数+${recipientCount}`);
  } catch (error) {
    console.error('更新用户邮件统计时出错:', error);
    throw error;
  }
}
