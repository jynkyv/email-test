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

        console.log('开始调用数据库 RPC 重新分配客户组...');

        // 调用数据库原生的 RPC 函数 assign_customer_groups 
        // 该函数会将有效客户按创建时间排序，每 5000 人分配为一个 group_id 并返回受影响的行数
        const { data, error } = await supabaseAdmin.rpc('assign_customer_groups');

        if (error) {
            console.error('调用 assign_customer_groups 失败:', error);
            return NextResponse.json(
                { error: '执行分组操作时数据库返回错误：' + error.message },
                { status: 500 }
            );
        }

        const affectedRows = data || 0;
        console.log(`分配完成，成功分配 ${affectedRows} 个客户`);
        const totalGroups = Math.ceil(affectedRows / 5000) || 0;

        return NextResponse.json({
            success: true,
            message: `成功分配了 ${affectedRows} 个客户，共产生 ${totalGroups} 个分组`,
            totalGroups: totalGroups
        });

    } catch (error: any) {
        console.error('分配客户组接口异常:', error);
        return NextResponse.json(
            { error: '执行分组操作时发生异常: ' + (error.message || '') },
            { status: 500 }
        );
    }
}
