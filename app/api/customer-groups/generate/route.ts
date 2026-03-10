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
            .select('role')
            .eq('id', userId)
            .single();

        if (userError || !userData || userData.role !== 'admin') {
            return NextResponse.json({ error: '没有权限执行此操作' }, { status: 403 });
        }

        console.log('开始重新分配客户组...');

        // 1. 获取所有有邮箱且未退订的客户ID，按创建时间排序保证稳定
        let allCustomerIds: string[] = [];
        let page = 0;
        const pageSize = 1000;

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('customers')
                .select('id')
                .not('email', 'is', null)
                .neq('email', '')
                .eq('unsubscribe', false)
                .order('created_at', { ascending: true })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error('获取客户列表失败:', error);
                return NextResponse.json({ error: '获取客户失败' }, { status: 500 });
            }

            if (!data || data.length === 0) break;

            allCustomerIds.push(...data.map(c => c.id));
            page++;
        }

        console.log(`共找到 ${allCustomerIds.length} 个符合条件的客户用于编组`);

        // 2. 将这些客户顺序分组 (按要求不重复，5000人一组)
        const GROUP_SIZE = 5000;

        let successCount = 0;

        // 分批更新以避免请求过大
        const BATCH_SIZE = 500;
        for (let i = 0; i < allCustomerIds.length; i += BATCH_SIZE) {
            const batchIds = allCustomerIds.slice(i, i + BATCH_SIZE);

            const promises = batchIds.map((id, indexInBatch) => {
                const globalIndex = i + indexInBatch;
                const groupId = Math.floor(globalIndex / GROUP_SIZE) + 1;

                return supabaseAdmin
                    .from('customers')
                    .update({ group_id: groupId })
                    .eq('id', id);
            });

            const results = await Promise.allSettled(promises);
            results.forEach((result) => {
                if (result.status === 'fulfilled' && !result.value.error) {
                    successCount++;
                }
            });

            console.log(`已处理 ${i + batchIds.length} / ${allCustomerIds.length} 个客户`);
        }

        console.log(`分配完成，成功分配 ${successCount} 个客户`);

        return NextResponse.json({
            success: true,
            message: `成功为 ${successCount} 个客户分配了分组`,
            totalGroups: Math.ceil(allCustomerIds.length / GROUP_SIZE)
        });

    } catch (error) {
        console.error('分配客户组失败:', error);
        return NextResponse.json(
            { error: '执行分组操作时发生错误' },
            { status: 500 }
        );
    }
}
