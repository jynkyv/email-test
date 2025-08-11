import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用Service Role Key创建管理员客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 创建具有管理员权限的客户端
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  console.log('📧 收到重新订阅请求');
  console.log('请求时间:', new Date().toISOString());

  try {
    // 获取请求数据
    const body = await request.json();
    const { email } = body;

    // 验证必需参数
    if (!email) {
      return NextResponse.json(
        { success: false, message: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log('重新订阅信息:', { 
      email, 
      ipAddress,
      userAgent
    });

    // 检查是否已经退订 - 同时检查两个表
    const [unsubscriptionResult, customerResult] = await Promise.all([
      supabaseAdmin
        .from('email_unsubscriptions')
        .select('id, created_at')
        .eq('email', email.toLowerCase())
        .single(),
      supabaseAdmin
        .from('customers')
        .select('unsubscribe, unsubscribe_at')
        .eq('email', email.toLowerCase())
        .single()
    ]);

    const existingUnsubscription = unsubscriptionResult.data;
    const customer = customerResult.data;

    // 检查是否真的需要重新订阅
    const needsResubscribe = existingUnsubscription || (customer && customer.unsubscribe);

    if (!needsResubscribe) {
      console.log('⚠️ 该邮箱未退订:', email);
      return NextResponse.json(
        { 
          success: true, 
          message: '该邮箱未退订，无需重新订阅',
          alreadySubscribed: true
        }
      );
    }

    // 删除退订记录（如果存在）
    if (existingUnsubscription) {
      const { error: deleteError } = await supabaseAdmin
        .from('email_unsubscriptions')
        .delete()
        .eq('email', email.toLowerCase());

      if (deleteError) {
        console.error('❌ 删除退订记录失败:', deleteError);
        return NextResponse.json(
          { success: false, message: '重新订阅处理失败' },
          { status: 500 }
        );
      }
    }

    // 更新客户表的unsubscribe字段
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        unsubscribe: false,
        unsubscribe_at: null
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('❌ 更新客户订阅状态失败:', updateError);
      // 如果客户表更新失败，但退订记录已删除，仍然认为重新订阅成功
    }

    console.log('✅ 重新订阅成功:', email);

    return NextResponse.json({
      success: true,
      message: '重新订阅成功',
      resubscribedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 重新订阅处理异常:', error);
    return NextResponse.json(
      { success: false, message: '重新订阅处理失败' },
      { status: 500 }
    );
  }
} 