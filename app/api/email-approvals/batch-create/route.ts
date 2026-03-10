import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: '未授权访问' }, { status: 401 });
        }

        const userId = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: '用户不存在' }, { status: 401 });
        }

        const body = await request.json();
        const { groupId, subject, content } = body;

        if (!groupId || !subject || !content) {
            return NextResponse.json(
                { error: '群组ID、邮件主题和内容不能为空' },
                { status: 400 }
            );
        }

        console.log(`开始为分组 ${groupId} 创建批量审核申请...`);

        // 1. 获取该分组内的所有客户邮箱
        let allEmails: string[] = [];
        let page = 0;
        const pageSize = 5000;

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('customers')
                .select('email')
                .eq('group_id', groupId)
                .not('email', 'is', null)
                .neq('email', '')
                .eq('unsubscribe', false)
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error('获取组成员失败:', error);
                return NextResponse.json({ error: '获取组成员失败' }, { status: 500 });
            }

            if (!data || data.length === 0) break;

            allEmails.push(...data.map(c => c.email));
            page++;
        }

        if (allEmails.length === 0) {
            return NextResponse.json(
                { error: `分组 ${groupId} 中没有任何有效的客户邮箱` },
                { status: 400 }
            );
        }

        console.log(`分组 ${groupId} 共找到 ${allEmails.length} 个邮箱。开始划分批次...`);

        // 2. 将这些邮箱划分为每次100个批次
        const BATCH_SIZE = 100;
        const approvalBatches = [];

        for (let i = 0; i < allEmails.length; i += BATCH_SIZE) {
            const chunk = allEmails.slice(i, i + BATCH_SIZE);
            approvalBatches.push({
                applicant_id: userId,
                subject: subject,
                content: content,
                recipients: chunk,
                status: 'pending',
                created_at: new Date().toISOString()
            });
        }

        console.log(`将创建 ${approvalBatches.length} 个审核申请，每个包含约 ${BATCH_SIZE} 个收件人`);

        // 3. 批量插入 email_approvals
        // Supabase insert 限制通常一次可以插很多，但保守点我们分批插入这50个对象
        let insertedCount = 0;

        // We can insert 50 rows at a time easily.
        const { data: insertResult, error: insertError } = await supabaseAdmin
            .from('email_approvals')
            .insert(approvalBatches);

        if (insertError) {
            console.error('批量创建审核申请失败:', insertError);
            return NextResponse.json(
                { error: '批量创建审核申请失败' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `成功为分组 ${groupId} 创建了 ${approvalBatches.length} 个审核申请`,
            batchesCreated: approvalBatches.length,
            totalEmails: allEmails.length
        });

    } catch (error) {
        console.error('批量创审核发生异常:', error);
        return NextResponse.json(
            { error: '批量创建审核申请失败' },
            { status: 500 }
        );
    }
}
