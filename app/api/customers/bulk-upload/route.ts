import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupId = formData.get('groupId') as string;
    
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

    // 验证文件大小（1MB限制）
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'FILE_TOO_LARGE' 
      }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json({ 
        success: false, 
        error: 'INVALID_FILE_TYPE' 
      }, { status: 400 });
    }

    // 如果指定了分组，检查分组是否存在且用户有权限
    if (groupId) {
      const { data: groupData, error: groupError } = await supabase
        .from('customer_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        return NextResponse.json({ 
          success: false, 
          error: 'GROUP_NOT_FOUND' 
        }, { status: 400 });
      }

      // 检查分组容量（最多2000个客户）
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      if (customerCount && customerCount >= 2000) {
        return NextResponse.json({ 
          success: false, 
          error: 'GROUP_CAPACITY_EXCEEDED' 
        }, { status: 400 });
      }
    }

    // 读取文件内容
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'INSUFFICIENT_DATA' 
      }, { status: 400 });
    }

    // 获取标题行
    const headers = jsonData[0] as string[];
    const headerMap = new Map(headers.map((header, index) => [header.toLowerCase(), index]));

    // 查找公司名称列
    const companyNameHeaders = ['公司名称', '会社名', '法人名', 'company name', 'company', 'name'];
    let companyNameIndex = -1;
    for (const header of companyNameHeaders) {
      if (headerMap.has(header)) {
        companyNameIndex = headerMap.get(header)!;
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

    // 查找邮箱列
    const emailHeaders = ['邮箱', 'e-mail', 'メール', 'email', 'mail'];
    let emailIndex = -1;
    for (const header of emailHeaders) {
      if (headerMap.has(header)) {
        emailIndex = headerMap.get(header)!;
        break;
      }
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
    const processedEmails = new Map<string, number>(); // 邮箱 -> 行号，用于记录重复
    const duplicateRows = []; // 记录重复的行号
    
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
        continue;
      }

      // 检查是否包含邮箱地址
      const emailMatch = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (!emailMatch) {
        // 如果没有找到邮箱地址，检查是否包含非邮箱内容
        const nonEmailContent = email.replace(/\s+/g, '').toLowerCase();
        if (nonEmailContent.includes('email') || nonEmailContent.includes('メール') || nonEmailContent.includes('mail')) {
          hasInvalidEmail = true;
          errors.push(`第${i + 1}行: 包含邮箱相关词汇但格式不正确，请检查数据`);
          break;
        } else {
          continue;
        }
      }

      // 提取邮箱地址
      email = emailMatch[0].toLowerCase();

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`第${i + 1}行: 邮箱格式不正确`);
        continue;
      }

      // 检查文件内是否有重复邮箱
      if (processedEmails.has(email)) {
        // 记录重复的行号，但跳过这条数据
        const firstRow = processedEmails.get(email)!;
        duplicateRows.push({
          row: i + 1,
          email: email,
          firstRow: firstRow + 1
        });
        continue; // 跳过重复的数据，保留第一条
      }

      // 记录邮箱和行号
      processedEmails.set(email, i);
      
      customers.push({
        company_name: companyName,
        email: email,
        created_by: userId,
        group_id: groupId || null
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

    // 分批检查邮箱是否已存在于数据库中
    const batchSize = 100;
    const existingEmailSet = new Set<string>();
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const batchEmails = batch.map(c => c.email);
      
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('email')
        .in('email', batchEmails);

      if (checkError) {
        console.error('检查现有邮箱失败:', checkError);
        return NextResponse.json({ 
          success: false, 
          error: 'CHECK_EXISTING_ERROR' 
        }, { status: 500 });
      }

      existingCustomers?.forEach((c: any) => existingEmailSet.add(c.email));
    }

    // 过滤出新客户（排除已存在于数据库中的邮箱）
    const newCustomers = customers.filter(c => !existingEmailSet.has(c.email));
    const dbDuplicateCount = customers.length - newCustomers.length;

    if (newCustomers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'ALL_EMAILS_EXIST' 
      }, { status: 400 });
    }

    // 插入新客户
    const { data: insertedCustomers, error: insertError } = await supabase
      .from('customers')
      .insert(newCustomers)
      .select();

    if (insertError) {
      console.error('批量插入客户失败:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'INSERT_ERROR',
        details: insertError.message
      }, { status: 500 });
    }

    const fileDuplicateCount = duplicateRows.length;
    const importedCount = insertedCustomers?.length || 0;
    const totalSkipped = dbDuplicateCount + fileDuplicateCount;

    // 构建详细的结果信息
    let resultMessage = `成功导入 ${importedCount} 个客户`;
    const skipDetails = [];
    
    if (fileDuplicateCount > 0) {
      skipDetails.push(`文件内重复: ${fileDuplicateCount} 个`);
    }
    
    if (dbDuplicateCount > 0) {
      skipDetails.push(`数据库已存在: ${dbDuplicateCount} 个`);
    }
    
    if (skipDetails.length > 0) {
      resultMessage += `，跳过 ${totalSkipped} 个重复邮箱 (${skipDetails.join(', ')})`;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      fileDuplicateCount,
      dbDuplicateCount,
      totalSkipped,
      duplicateRows, // 返回重复行的详细信息
      message: resultMessage
    });

  } catch (error) {
    console.error('批量上传处理失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'PROCESSING_ERROR',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 