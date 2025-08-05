import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSingleEmail } from '@/lib/sendgrid';

// 自动处理邮件队列的后台任务
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可以添加webhook密钥验证）
    const authHeader = request.headers.get('authorization');
    const webhookKey = request.headers.get('x-webhook-key');
    
    // 允许通过webhook密钥或管理员权限访问
    let isAuthorized = false;
    
    if (webhookKey && webhookKey === process.env.EMAIL_QUEUE_WEBHOOK_KEY) {
      isAuthorized = true;
    } else if (authHeader) {
      const userId = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (userData?.role === 'admin') {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    console.log('🚀 开始自动处理邮件队列...');
    
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let hasMore = true;
    let iteration = 0;
    const maxIterations = 10; // 防止无限循环

    // 持续处理队列直到没有待处理邮件或达到最大迭代次数
    while (hasMore && iteration < maxIterations) {
      iteration++;
      console.log(`📧 队列处理迭代 ${iteration}...`);

      // 清理长时间处于处理中状态的邮件
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabase
        .from('email_queue')
        .update({ 
          status: 'pending',
          processed_at: null
        })
        .eq('status', 'processing')
        .lt('processed_at', fiveMinutesAgo);

      // 获取待处理的邮件（每次处理最多50个）
      const { data: pendingEmails, error: fetchError } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('retry_count', 3)
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) {
        console.error('获取待处理邮件失败:', fetchError);
        break;
      }

      if (!pendingEmails || pendingEmails.length === 0) {
        console.log('✅ 没有待处理的邮件，处理完成');
        hasMore = false;
        break;
      }

      console.log(`📨 处理 ${pendingEmails.length} 个邮件...`);

      // 处理每个邮件
      for (const email of pendingEmails) {
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
            
            // 记录发送的邮件到customer_emails表
            await recordSentEmail(email.recipient, email.subject, email.content, email.approval_id, result.id);
            
            // 发送成功
            await supabase
              .from('email_queue')
              .update({ 
                status: 'sent',
                processed_at: new Date().toISOString()
              })
              .eq('id', email.id);

            totalSuccess++;
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

            totalFailed++;
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
          
          totalFailed++;
        }
        
        totalProcessed++;
      }

      // 短暂等待，避免过于频繁的数据库操作
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 自动队列处理完成: 处理 ${totalProcessed} 个邮件，成功 ${totalSuccess}，失败 ${totalFailed}`);

    return NextResponse.json({
      success: true,
      message: '自动队列处理完成',
      stats: {
        totalProcessed,
        totalSuccess,
        totalFailed,
        iterations: iteration
      }
    });

  } catch (error) {
    console.error('自动队列处理失败:', error);
    return NextResponse.json(
      { error: '自动队列处理失败' },
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