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
        error: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'FILE_NOT_FOUND' 
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
        error: 'INVALID_FILE_TYPE' 
      }, { status: 400 });
    }

    // 验证文件大小 (1MB)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'FILE_TOO_LARGE' 
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
        error: 'INSUFFICIENT_DATA' 
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
        error: 'MISSING_COMPANY_COLUMN',
        details: companyNameHeaders.join(', ')
      }, { status: 400 });
    }
    
    if (emailIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'MISSING_EMAIL_COLUMN',
        details: emailHeaders.join(', ')
      }, { status: 400 });
    }

    // 处理数据行
    const customers = [];
    const errors = [];
    let hasInvalidEmail = false;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const companyName = row[companyNameIndex]?.toString().trim();
      let email = row[emailIndex]?.toString().trim();

      // 验证公司名称
      if (!companyName) {
        errors.push(`第${i + 1}行: 公司名称不能为空`);
        continue;
      }

      // 如果没有邮箱，跳过这一行
      if (!email) {
        continue; // 忽略没有邮箱的行
      }

      // 检查是否包含邮箱地址
      const emailMatch = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (!emailMatch) {
        // 如果没有找到邮箱地址，检查是否包含非邮箱内容
        const nonEmailContent = email.replace(/\s+/g, '').toLowerCase();
        if (nonEmailContent.includes('email') || nonEmailContent.includes('メール') || nonEmailContent.includes('mail')) {
          // 包含邮箱相关词汇但没有有效邮箱地址，终止操作
          hasInvalidEmail = true;
          errors.push(`第${i + 1}行: 包含邮箱相关词汇但格式不正确，请检查数据`);
          break;
        } else {
          // 不包含邮箱相关词汇，跳过这一行
          continue;
        }
      }

      // 提取邮箱地址
      email = emailMatch[0];

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

    // 如果发现无效邮箱格式，终止操作
    if (hasInvalidEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'VALIDATION_FAILED',
        details: errors.join('\n')
      }, { status: 400 });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'VALIDATION_FAILED',
        details: errors.join('\n')
      }, { status: 400 });
    }

    if (customers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'NO_VALID_DATA' 
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
        error: 'CHECK_EXISTING_ERROR' 
      }, { status: 500 });
    }

    const existingEmailSet = new Set(existingCustomers?.map((c: any) => c.email) || []);
    const newCustomers = customers.filter(c => !existingEmailSet.has(c.email));

    if (newCustomers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'ALL_EMAILS_EXIST' 
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
        error: 'INSERT_ERROR' 
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
      error: 'PROCESSING_ERROR' 
    }, { status: 500 });
  }
} 