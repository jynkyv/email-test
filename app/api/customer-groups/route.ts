import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: '未授权访问' }, { status: 401 });
        }

        // 获取分组情况
        // 由于Supabase不支持直接的GROUP BY结合聚合函数的简单RPC，我们需要：
        // 方案A：调用RPC (如果没有创建RPC会很麻烦)
        // 方案B：查询所有有 group_id 的部分数据并在内存聚合
        // 因为数据量也就几万，方案B可行

        let allGroupDatas: { send_group_id: number }[] = [];
        let page = 0;
        const pageSize = 1000;

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('customers')
                .select('send_group_id')
                .not('send_group_id', 'is', null)
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error('获取分组失败:', error);
                return NextResponse.json({ error: '获取分组失败' }, { status: 500 });
            }

            if (!data || data.length === 0) break;
            allGroupDatas.push(...data as any);
            page++;
        }

        // 统计每组人数
        const groupCounts: Record<number, number> = {};
        allGroupDatas.forEach((item) => {
            const gId = item.send_group_id;
            if (groupCounts[gId]) {
                groupCounts[gId]++;
            } else {
                groupCounts[gId] = 1;
            }
        });

        const groups = Object.keys(groupCounts).map(id => ({
            id: parseInt(id),
            name: `分组 ${id}`,
            count: groupCounts[parseInt(id)]
        })).sort((a, b) => a.id - b.id);

        return NextResponse.json({
            success: true,
            groups
        });

    } catch (error) {
        console.error('获取客户组失败:', error);
        return NextResponse.json(
            { error: '获取客户组失败' },
            { status: 500 }
        );
    }
}
