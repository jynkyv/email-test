import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // 从请求头获取用户ID
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: '未提供用户认证信息' 
      }, { status: 401 });
    }
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: '没有找到上传的文件' 
      }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: '只支持Excel文件格式(.xlsx, .xls)' 
      }, { status: 400 });
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: '文件大小不能超过5MB' 
      }, { status: 400 });
    }

    // 读取Excel文件
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Excel文件至少需要包含标题行和一行数据' 
      }, { status: 400 });
    }

    // 验证标题行
    const headers = jsonData[0] as string[];
    
    // 支持多种列名格式
    const companyNameHeaders = ['公司名称', '会社名', '法人名', '企业名称'];
    const emailHeaders = ['邮箱', 'E-Mail', 'メール', 'email'];
    
    // 查找公司名称列
    let companyNameIndex = -1;
    for (const header of companyNameHeaders) {
      const index = headers.indexOf(header);
      if (index !== -1) {
        companyNameIndex = index;
        break;
      }
    }
    
    // 查找邮箱列
    let emailIndex = -1;
    for (const header of emailHeaders) {
      const index = headers.indexOf(header);
      if (index !== -1) {
        emailIndex = index;
        break;
      }
    }
    
    if (companyNameIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: `Excel文件必须包含公司名称列，支持的列名: ${companyNameHeaders.join(', ')}` 
      }, { status: 400 });
    }
    
    if (emailIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: `Excel文件必须包含邮箱列，支持的列名: ${emailHeaders.join(', ')}` 
      }, { status: 400 });
    }

    // 处理数据行
    const customers = [];
    const errors = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const companyName = row[companyNameIndex]?.toString().trim();
      let email = row[emailIndex]?.toString().trim();

      // 验证数据
      if (!companyName) {
        errors.push(`第${i + 1}行: 公司名称不能为空`);
        continue;
      }

      if (!email) {
        errors.push(`第${i + 1}行: 邮箱不能为空`);
        continue;
      }

      // 提取邮箱地址 - 移除前面的文本（如"Eメール"）
      const emailMatch = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        email = emailMatch[0];
      } else {
        errors.push(`第${i + 1}行: 无法从文本中提取有效的邮箱地址`);
        continue;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`第${i + 1}行: 邮箱格式不正确`);
        continue;
      }

      customers.push({
        company_name: companyName,
        email: email.toLowerCase(),
        created_by: userId // 添加创建者ID
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `数据验证失败:\n${errors.join('\n')}` 
      }, { status: 400 });
    }

    if (customers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有找到有效的客户数据' 
      }, { status: 400 });
    }

    // 检查邮箱是否已存在
    const existingEmails = customers.map(c => c.email);
    const { data: existingCustomers, error: checkError } = await supabase
      .from('customers')
      .select('email')
      .in('email', existingEmails);

    if (checkError) {
      console.error('检查现有邮箱失败:', checkError);
      return NextResponse.json({ 
        success: false, 
        error: '检查现有数据时发生错误' 
      }, { status: 500 });
    }

    const existingEmailSet = new Set(existingCustomers?.map((c: any) => c.email) || []);
    const newCustomers = customers.filter(c => !existingEmailSet.has(c.email));

    if (newCustomers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '所有客户邮箱都已存在' 
      }, { status: 400 });
    }

    // 批量插入新客户
    const { data: insertedCustomers, error: insertError } = await supabase
      .from('customers')
      .insert(newCustomers)
      .select();

    if (insertError) {
      console.error('批量插入客户失败:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: '批量插入客户数据时发生错误' 
      }, { status: 500 });
    }

    const skippedCount = customers.length - newCustomers.length;
    const importedCount = newCustomers.length;

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `成功导入 ${importedCount} 个客户${skippedCount > 0 ? `，跳过 ${skippedCount} 个重复邮箱` : ''}`
    });

  } catch (error) {
    console.error('批量上传处理失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '处理上传文件时发生错误' 
    }, { status: 500 });
  }
} 