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

    // 查找邮箱列（可选）
    const emailHeaders = ['邮箱', 'e-mail', 'メール', 'email', 'mail'];
    let emailIndex = -1;
    for (const header of emailHeaders) {
      if (headerMap.has(header)) {
        emailIndex = headerMap.get(header)!;
        break;
      }
    }

    // 查找传真列（可选）
    const faxHeaders = ['传真', 'FAX', 'fax', 'fax number'];
    let faxIndex = -1;
    for (const header of faxHeaders) {
      if (headerMap.has(header)) {
        faxIndex = headerMap.get(header)!;
        break;
      }
    }

    // 查找地址列（可选）
    const addressHeaders = ['地址', 'Address', 'address', '住所', 'location'];
    let addressIndex = -1;
    for (const header of addressHeaders) {
      if (headerMap.get(header)) {
        addressIndex = headerMap.get(header)!;
        break;
      }
    }

    // 处理数据行
    const customers = [];
    const errors = [];
    let hasInvalidEmail = false;
    const fileProcessedEmails = new Map<string, number>(); // 邮箱 -> 行号，用于记录文件内重复
    const duplicateRows = []; // 记录重复的行号
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const companyName = row[companyNameIndex]?.toString().trim();
      let email = row[emailIndex]?.toString().trim();
      let fax = faxIndex !== -1 ? row[faxIndex]?.toString().trim() : '';
      const address = addressIndex !== -1 ? row[addressIndex]?.toString().trim() : '';

      // 处理fax列：保留数组和-符号，删除其他前缀
      if (fax) {
        // 移除常见的前缀，但保留数组和-符号
        const originalFax = fax;
        fax = fax
          .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ|fax\s*number|FAX\s*NUMBER|Fax\s*Number|传真号码|ＦＡＸ番号)\s*[:：]?\s*/gi, '') // 修复：添加可选的冒号
          .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ)\s*/gi, '') // 修复：移除空格要求
          .replace(/^[+＋]\s*/, '') // 移除加号前缀
          .replace(/^[0０]\s*/, '') // 移除0前缀
          .replace(/^[8８][1１][-－]\s*/, '') // 移除81-前缀
          .replace(/^[8８][1１]\s*/, '') // 移除81前缀
          .trim();
        
        // 如果处理后的传真为空，使用原始值
        if (!fax && originalFax) {
          fax = originalFax;
        }
      }

      // 验证公司名称
      if (!companyName) {
        errors.push(`第${i + 1}行: 公司名称不能为空`);
        continue;
      }

      // 如果没有邮箱和传真，跳过这一行
      if (!email && !fax) {
        continue;
      }

      // 如果有邮箱，验证邮箱格式
      if (email) {
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
      }

      // 如果有邮箱，检查文件内是否有重复邮箱
      if (email) {
        if (fileProcessedEmails.has(email)) {
          // 记录重复的行号
          const firstRow = fileProcessedEmails.get(email)!;
          duplicateRows.push({
            row: i + 1,
            email: email,
            firstRow: firstRow + 1
          });
          
          // 检查移除邮箱后是否还有有效联系信息
          if (fax) {
            // 有传真，保留记录但移除邮箱
            customers.push({
              company_name: companyName,
              email: null, // 移除重复的邮箱
              fax: fax,
              address: address || null,
              fax_status: 'inactive',
              created_by: userId,
              group_id: groupId || null
            });
          }
          // 如果没有传真，跳过这条记录（不添加到customers数组中）
          continue;
        }

        // 记录邮箱和行号
        fileProcessedEmails.set(email, i);
      }
      
      customers.push({
        company_name: companyName,
        email: email,
        fax: fax || null,
        address: address || null,
        fax_status: fax ? 'inactive' : null,
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

    // 分批检查邮箱和传真是否已存在于数据库中
    const customersWithEmail = customers.filter(c => c.email);
    const customersWithFax = customers.filter(c => c.fax);
    const existingEmailSet = new Set<string>();
    const existingFaxSet = new Set<string>();
    
    // 检查现有邮箱
    if (customersWithEmail.length > 0) {
      const batchSize = 100;
      
      for (let i = 0; i < customersWithEmail.length; i += batchSize) {
        const batch = customersWithEmail.slice(i, i + batchSize);
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
    }

    // 检查现有传真
    if (customersWithFax.length > 0) {
      const batchSize = 100;
      
      for (let i = 0; i < customersWithFax.length; i += batchSize) {
        const batch = customersWithFax.slice(i, i + batchSize);
        const batchFaxes = batch.map(c => c.fax);
        
        const { data: existingCustomers, error: checkError } = await supabase
          .from('customers')
          .select('fax')
          .in('fax', batchFaxes);

        if (checkError) {
          console.error('检查现有传真失败:', checkError);
          return NextResponse.json({ 
            success: false, 
            error: 'CHECK_EXISTING_ERROR' 
          }, { status: 500 });
        }

        existingCustomers?.forEach((c: any) => existingFaxSet.add(c.fax));
      }
    }

    // 智能处理重复数据
    const processedCustomers = [];
    const skippedCustomers = [];
    
    for (const customer of customers) {
      const hasEmailConflict = customer.email && existingEmailSet.has(customer.email);
      const hasFaxConflict = customer.fax && existingFaxSet.has(customer.fax);
      
      if (hasEmailConflict && hasFaxConflict) {
        // 邮箱和传真都重复，完全跳过这条记录
        skippedCustomers.push({
          ...customer,
          reason: 'email_and_fax_duplicate',
          details: `邮箱和传真都已存在`
        });
        continue;
      } else if (hasEmailConflict && !hasFaxConflict) {
        // 只有邮箱重复，检查移除邮箱后是否还有有效联系信息
        if (customer.fax) {
          // 有传真，保留记录但移除邮箱
          processedCustomers.push({
            company_name: customer.company_name,
            email: null, // 移除重复的邮箱
            fax: customer.fax,
            address: customer.address || null,
            fax_status: 'inactive',
            created_by: userId,
            group_id: groupId || null
          });
        } else {
          // 没有传真，移除邮箱后就没有有效联系信息了，跳过这条记录
          skippedCustomers.push({
            ...customer,
            reason: 'email_duplicate_no_fax',
            details: `邮箱重复且没有传真，无法保留有效联系信息`
          });
          continue;
        }
      } else {
        // 传真重复或没有冲突，都保留完整记录（传真重复时不移除传真）
        processedCustomers.push({
          company_name: customer.company_name,
          email: customer.email || null,
          fax: customer.fax || null,
          address: customer.address || null,
          fax_status: customer.fax ? 'inactive' : null,
          created_by: userId,
          group_id: groupId || null
        });
      }
    }

    if (processedCustomers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'ALL_EMAILS_EXIST',
        details: '所有客户都已存在或没有有效的联系信息'
      }, { status: 400 });
    }

    // 再次检查处理后的客户是否有重复（防止文件内重复）
    const finalCustomers = [];
    const finalProcessedEmails = new Set<string>();
    const finalProcessedFaxes = new Set<string>();
    
    for (const customer of processedCustomers) {
      const emailConflict = customer.email && finalProcessedEmails.has(customer.email);
      const faxConflict = customer.fax && finalProcessedFaxes.has(customer.fax);
      
      if (emailConflict && faxConflict) {
        // 文件内邮箱和传真都重复，跳过
        skippedCustomers.push({
          ...customer,
          reason: 'file_internal_duplicate',
          details: `文件内邮箱和传真重复`
        });
        continue;
      } else if (emailConflict) {
        // 文件内邮箱重复，检查移除邮箱后是否还有有效联系信息
        if (customer.fax) {
          // 有传真，移除邮箱但保留记录
          finalCustomers.push({
            ...customer,
            email: null
          });
          finalProcessedFaxes.add(customer.fax);
        } else {
          // 没有传真，移除邮箱后就没有有效联系信息了，跳过这条记录
          skippedCustomers.push({
            ...customer,
            reason: 'file_email_duplicate_no_fax',
            details: `文件内邮箱重复且没有传真，无法保留有效联系信息`
          });
          continue;
        }
      } else {
        // 传真重复或没有冲突，都保留完整记录（传真重复时不移除传真）
        finalCustomers.push(customer);
        if (customer.email) finalProcessedEmails.add(customer.email);
        if (customer.fax) finalProcessedFaxes.add(customer.fax);
      }
    }

    if (finalCustomers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'NO_VALID_DATA',
        details: '处理后没有有效的客户数据'
      }, { status: 400 });
    }

    // 分批插入最终处理后的客户
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < finalCustomers.length; i += batchSize) {
      const batch = finalCustomers.slice(i, i + batchSize);
      
      const { data: insertedBatch, error: insertError } = await supabase
        .from('customers')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('批量插入客户失败:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: 'INSERT_ERROR',
          details: insertError.message
        }, { status: 500 });
      }

      totalInserted += insertedBatch?.length || 0;
    }

    const fileDuplicateCount = duplicateRows.length;
    const dbDuplicateCount = skippedCustomers.length;
    const importedCount = totalInserted;
    const totalSkipped = dbDuplicateCount + fileDuplicateCount;

    // 构建详细的结果信息
    let resultMessage = `成功导入 ${importedCount} 个客户`;
    const skipDetails = [];
    
    if (fileDuplicateCount > 0) {
      skipDetails.push(`文件内重复: ${fileDuplicateCount} 个`);
    }
    
    if (dbDuplicateCount > 0) {
      skipDetails.push(`数据库重复: ${dbDuplicateCount} 个`);
    }
    
    if (skipDetails.length > 0) {
      resultMessage += `，跳过 ${totalSkipped} 个重复记录 (${skipDetails.join(', ')})`;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      fileDuplicateCount,
      dbDuplicateCount,
      totalSkipped,
      duplicateRows, // 返回重复行的详细信息
      skippedCustomers, // 返回被跳过的客户信息
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