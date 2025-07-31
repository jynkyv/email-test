import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  console.log('🚀 开始处理批量上传请求...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupId = formData.get('groupId') as string;
    
    console.log(` 文件信息: ${file?.name}, 大小: ${file?.size} bytes`);
    console.log(` 分组ID: ${groupId || '未指定'}`);
    
    // 从请求头获取用户ID
    const authHeader = request.headers.get('Authorization');
    const userId = authHeader?.replace('Bearer ', '');
    
    if (!userId) {
      console.log('❌ 认证失败: 缺少用户ID');
      return NextResponse.json({ 
        success: false, 
        error: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }
    
    console.log(`👤 用户ID: ${userId}`);
    
    if (!file) {
      console.log('❌ 文件验证失败: 未找到文件');
      return NextResponse.json({ 
        success: false, 
        error: 'FILE_NOT_FOUND' 
      }, { status: 400 });
    }

    // 验证文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      console.log(`❌ 文件过大: ${file.size} bytes > 10MB`);
      return NextResponse.json({ 
        success: false, 
        error: 'FILE_TOO_LARGE' 
      }, { status: 400 });
    }

    console.log('✅ 文件大小验证通过');

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      console.log(`❌ 文件类型不支持: ${file.type}`);
      return NextResponse.json({ 
        success: false, 
        error: 'INVALID_FILE_TYPE' 
      }, { status: 400 });
    }

    console.log('✅ 文件类型验证通过');

    // 如果指定了分组，检查分组是否存在且用户有权限
    if (groupId) {
      console.log(`🔍 检查分组信息: ${groupId}`);
      
      const { data: groupData, error: groupError } = await supabase
        .from('customer_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        console.log(`❌ 分组不存在: ${groupId}`);
        return NextResponse.json({ 
          success: false, 
          error: 'GROUP_NOT_FOUND' 
        }, { status: 400 });
      }

      console.log(`✅ 分组验证通过: ${groupData.name}`);

      // 检查分组容量（最多2000个客户）
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      console.log(`📊 分组当前客户数: ${customerCount || 0}`);

      if (customerCount && customerCount >= 2000) {
        console.log(`❌ 分组容量已满: ${customerCount}/2000`);
        return NextResponse.json({ 
          success: false, 
          error: 'GROUP_CAPACITY_EXCEEDED' 
        }, { status: 400 });
      }
    }

    console.log(' 开始读取Excel文件...');
    
    // 读取文件内容
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(` 文件读取完成: ${jsonData.length} 行数据, 工作表: ${sheetName}`);

    if (jsonData.length < 2) {
      console.log('❌ 数据不足: 至少需要标题行和一行数据');
      return NextResponse.json({ 
        success: false, 
        error: 'INSUFFICIENT_DATA' 
      }, { status: 400 });
    }

    // 获取标题行
    const headers = jsonData[0] as string[];
    const headerMap = new Map(headers.map((header, index) => [header.toLowerCase(), index]));

    console.log(`📋 文件标题行: ${headers.join(', ')}`);

    // 查找公司名称列
    const companyNameHeaders = ['公司名称', '会社名', '法人名', 'company name', 'company', 'name'];
    let companyNameIndex = -1;
    for (const header of companyNameHeaders) {
      if (headerMap.has(header.toLowerCase())) {  // 修复：使用小写版本查找
        companyNameIndex = headerMap.get(header.toLowerCase())!;
        break;
      }
    }
    
    if (companyNameIndex === -1) {
      console.log(`❌ 未找到公司名称列，支持的列名: ${companyNameHeaders.join(', ')}`);
      return NextResponse.json({ 
        success: false, 
        error: 'MISSING_COMPANY_COLUMN',
        details: companyNameHeaders.join(', ')
      }, { status: 400 });
    }

    console.log(`✅ 找到公司名称列: ${headers[companyNameIndex]} (索引: ${companyNameIndex})`);

    // 查找邮箱列（可选）
    const emailHeaders = ['邮箱', 'e-mail', 'E-Mail', 'E-mail', 'e-Mail', 'メール', 'email', 'mail', 'Email', 'EMAIL', 'MAIL'];
    let emailIndex = -1;
    for (const header of emailHeaders) {
      if (headerMap.has(header.toLowerCase())) {  // 修复：使用小写版本查找
        emailIndex = headerMap.get(header.toLowerCase())!;
        break;
      }
    }

    if (emailIndex !== -1) {
      console.log(`✅ 找到邮箱列: ${headers[emailIndex]} (索引: ${emailIndex})`);
    } else {
      console.log(`⚠️ 未找到邮箱列，支持的列名: ${emailHeaders.join(', ')}`);
    }

    // 添加调试信息
    console.log(' 邮箱列查找结果:', {
      headers: headers,
      headerMap: Object.fromEntries(headerMap),
      emailIndex: emailIndex,
      emailHeaders: emailHeaders
    });

    // 查找传真列（可选）
    const faxHeaders = ['传真', 'FAX', 'fax', 'fax number'];
    let faxIndex = -1;
    for (const header of faxHeaders) {
      if (headerMap.has(header.toLowerCase())) {  // 修复：使用小写版本查找
        faxIndex = headerMap.get(header.toLowerCase())!;
        break;
      }
    }

    if (faxIndex !== -1) {
      console.log(`✅ 找到传真列: ${headers[faxIndex]} (索引: ${faxIndex})`);
    } else {
      console.log(`⚠️ 未找到传真列，支持的列名: ${faxHeaders.join(', ')}`);
    }

    // 查找地址列（可选）
    const addressHeaders = ['地址', 'Address', 'address', '住所', 'location'];
    let addressIndex = -1;
    for (const header of addressHeaders) {
      if (headerMap.has(header.toLowerCase())) {  // 修复：使用小写版本查找
        addressIndex = headerMap.get(header.toLowerCase())!;
        break;
      }
    }

    if (addressIndex !== -1) {
      console.log(`✅ 找到地址列: ${headers[addressIndex]} (索引: ${addressIndex})`);
    } else {
      console.log(`⚠️ 未找到地址列，支持的列名: ${addressHeaders.join(', ')}`);
    }

    console.log(' 开始处理数据行...');

    // 处理数据行
    const customers = [];
    const errors = [];
    let hasInvalidEmail = false;
    const fileProcessedEmails = new Map<string, number>(); // 邮箱 -> 行号，用于记录文件内重复
    const duplicateRows = []; // 记录重复的行号
    
    // 添加调试信息
    let processedCount = 0;
    let emailFoundCount = 0;
    let emailValidCount = 0;
    let faxFoundCount = 0;
    let addressFoundCount = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) {
        console.log(`⏭️ 跳过空行: 第${i + 1}行`);
        continue;
      }

      processedCount++;
      const companyName = row[companyNameIndex]?.toString().trim();
      let email = row[emailIndex]?.toString().trim();
      let fax = faxIndex !== -1 ? row[faxIndex]?.toString().trim() : '';
      const address = addressIndex !== -1 ? row[addressIndex]?.toString().trim() : '';

      // 添加调试信息
      if (email) {
        emailFoundCount++;
        console.log(`📧 第${i + 1}行邮箱: "${email}"`);
      }

      if (fax) {
        faxFoundCount++;
      }

      if (address) {
        addressFoundCount++;
      }

      // 处理fax列：保留数组和-符号，删除其他前缀
      if (fax) {
        // 移除常见的前缀，但保留数组和-符号
        const originalFax = fax;
        fax = fax
          .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ|fax\s*number|FAX\s*NUMBER|Fax\s*Number|传真号码|ＦＡＸ番号)\s*[:：]?\s*/gi, '') // 修复：添加可选的冒号
          .replace(/^(fax|FAX|Fax|传真|ＦＡＸ|Ｆａｘ)\s*/gi, '') // 修复：移除空格要求
          .replace(/^[+＋]\s*/, '') // 移除加号前缀
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
        console.log(`❌ 第${i + 1}行: 公司名称不能为空`);
        errors.push(`第${i + 1}行: 公司名称不能为空`);
        continue;
      }

      // 如果没有邮箱和传真，跳过这一行
      if (!email && !fax) {
        console.log(`⏭️ 第${i + 1}行: 没有邮箱和传真，跳过`);
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
            console.log(`❌ 第${i + 1}行: 包含邮箱相关词汇但格式不正确`);
            errors.push(`第${i + 1}行: 包含邮箱相关词汇但格式不正确，请检查数据`);
            break;
          } else {
            // 添加调试信息
            console.log(`⚠️ 第${i + 1}行邮箱格式无效: "${email}"`);
            continue;
          }
        }

        // 提取邮箱地址
        email = emailMatch[0].toLowerCase();
        emailValidCount++;

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.log(`❌ 第${i + 1}行: 邮箱格式不正确: ${email}`);
          errors.push(`第${i + 1}行: 邮箱格式不正确`);
          continue;
        }
      }

      // 修复：简化重复处理逻辑，确保不重复保留
      if (email) {
        if (fileProcessedEmails.has(email)) {
          // 记录重复的行号
          const firstRow = fileProcessedEmails.get(email)!;
          duplicateRows.push({
            row: i + 1,
            email: email,
            firstRow: firstRow + 1
          });
          
          // 添加调试信息
          console.log(` 第${i + 1}行邮箱重复，跳过: "${email}" (第一次出现在第${firstRow + 1}行)`);
          
          // 跳过重复记录，不添加到customers数组
          continue;
        }

        // 记录邮箱和行号
        fileProcessedEmails.set(email, i);
      }
      
      // 正常添加记录（包括没有邮箱但有传真的记录）
      customers.push({
        company_name: companyName,
        email: email,
        fax: fax || null,
        address: address || null,
        fax_status: fax ? 'inactive' : null,
        created_by: userId,
        group_id: groupId || null
      });

      // 每处理100行打印一次进度
      if (processedCount % 100 === 0) {
        console.log(`📊 已处理 ${processedCount} 行数据...`);
      }
    }

    // 添加调试信息
    console.log('📈 数据处理统计:', {
      processedCount,
      emailFoundCount,
      emailValidCount,
      faxFoundCount,
      addressFoundCount,
      customersCount: customers.length,
      customersWithEmail: customers.filter(c => c.email).length,
      customersWithFax: customers.filter(c => c.fax).length,
      duplicateRowsCount: duplicateRows.length,
      skippedDueToDuplicates: emailValidCount - customers.filter(c => c.email).length
    });

    // 如果发现无效邮箱格式，终止操作
    if (hasInvalidEmail) {
      console.log('❌ 发现无效邮箱格式，终止处理');
      return NextResponse.json({ 
        success: false, 
        error: 'VALIDATION_FAILED',
        details: errors.join('\n')
      }, { status: 400 });
    }

    if (errors.length > 0) {
      console.log(`❌ 验证失败，错误数: ${errors.length}`);
      return NextResponse.json({ 
        success: false, 
        error: 'VALIDATION_FAILED',
        details: errors.join('\n')
      }, { status: 400 });
    }

    if (customers.length === 0) {
      console.log('❌ 没有有效数据可导入');
      return NextResponse.json({ 
        success: false, 
        error: 'NO_VALID_DATA' 
      }, { status: 400 });
    }

    console.log(`✅ 数据验证完成，准备导入 ${customers.length} 个客户`);

    // 只检查邮箱是否已存在于数据库中（传真不检查重复）
    const customersWithEmail = customers.filter(c => c.email);
    const existingEmailSet = new Set<string>();
    
    console.log(`🔍 开始检查数据库中的重复邮箱...`);
    console.log(`📧 需要检查邮箱: ${customersWithEmail.length} 个`);
    
    // 检查现有邮箱
    if (customersWithEmail.length > 0) {
      const batchSize = 100;
      
      for (let i = 0; i < customersWithEmail.length; i += batchSize) {
        const batch = customersWithEmail.slice(i, i + batchSize);
        const batchEmails = batch.map(c => c.email);
        
        console.log(`🔍 检查邮箱批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(customersWithEmail.length/batchSize)}`);
        
        const { data: existingCustomers, error: checkError } = await supabase
          .from('customers')
          .select('email')
          .in('email', batchEmails);

        if (checkError) {
          console.error('❌ 检查现有邮箱失败:', checkError);
          return NextResponse.json({ 
            success: false, 
            error: 'CHECK_EXISTING_ERROR' 
          }, { status: 500 });
        }

        existingCustomers?.forEach((c: any) => existingEmailSet.add(c.email));
      }
      
      console.log(` 发现重复邮箱: ${existingEmailSet.size} 个`);
    }

    console.log(' 开始处理重复邮箱数据...');

    // 处理重复邮箱数据
    const processedCustomers = [];
    const skippedCustomers = [];
    
    for (const customer of customers) {
      const hasEmailConflict = customer.email && existingEmailSet.has(customer.email);
      
      if (hasEmailConflict) {
        // 邮箱重复，跳过这条记录
        skippedCustomers.push({
          ...customer,
          reason: 'email_duplicate',
          details: `邮箱 ${customer.email} 已存在于数据库中`
        });
        continue;
      } else {
        // 没有邮箱冲突，保留完整记录
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

    console.log(`📊 邮箱重复处理结果: 保留 ${processedCustomers.length} 个，跳过 ${skippedCustomers.length} 个`);

    if (processedCustomers.length === 0) {
      console.log('❌ 处理后没有有效数据可导入');
      return NextResponse.json({ 
        success: false, 
        error: 'ALL_EMAILS_EXIST',
        details: '所有客户邮箱都已存在'
      }, { status: 400 });
    }

    // 再次检查处理后的客户是否有重复（防止文件内重复）
    console.log('🔄 检查文件内邮箱重复...');
    
    const finalCustomers = [];
    const finalProcessedEmails = new Set<string>();
    
    for (const customer of processedCustomers) {
      const emailConflict = customer.email && finalProcessedEmails.has(customer.email);
      
      if (emailConflict) {
        // 文件内邮箱重复，跳过
        skippedCustomers.push({
          ...customer,
          reason: 'file_internal_email_duplicate',
          details: `文件内邮箱重复`
        });
        continue;
      } else {
        // 没有邮箱冲突，保留完整记录
        finalCustomers.push(customer);
        if (customer.email) finalProcessedEmails.add(customer.email);
      }
    }

    console.log(` 文件内重复检查完成: 最终保留 ${finalCustomers.length} 个客户`);

    if (finalCustomers.length === 0) {
      console.log('❌ 最终处理后没有有效数据可导入');
      return NextResponse.json({ 
        success: false, 
        error: 'NO_VALID_DATA',
        details: '处理后没有有效的客户数据'
      }, { status: 400 });
    }

    console.log(`💾 开始批量插入 ${finalCustomers.length} 个客户到数据库...`);

    // 分批插入最终处理后的客户
    const batchSize = 50;
    let totalInserted = 0;
    const insertErrors = []; // 记录插入错误
    
    for (let i = 0; i < finalCustomers.length; i += batchSize) {
      const batch = finalCustomers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(finalCustomers.length/batchSize);
      
      console.log(` 插入批次 ${batchNumber}/${totalBatches} (${batch.length} 个客户)`);
      
      const { data: insertedBatch, error: insertError } = await supabase
        .from('customers')
        .insert(batch)
        .select();

      if (insertError) {
        console.error(`❌ 批次 ${batchNumber} 插入失败:`, insertError);
        
        // 检查是否是唯一约束错误
        if (insertError.code === '23505' && insertError.message.includes('customers_email_key')) {
          // 邮箱重复错误，记录但不终止上传
          insertErrors.push({
            type: 'email_duplicate',
            message: '部分邮箱已存在于数据库中',
            count: batch.length
          });
          
          console.log(` 批次 ${batchNumber} 发现重复邮箱，尝试逐个插入...`);
          
          // 尝试逐个插入，跳过重复的邮箱
          for (const customer of batch) {
            try {
              const { data: singleInsert, error: singleError } = await supabase
                .from('customers')
                .insert(customer)
                .select();
              
              if (!singleError) {
                totalInserted += 1;
                console.log(`✅ 成功插入: ${customer.company_name}`);
              } else if (singleError.code === '23505' && singleError.message.includes('customers_email_key')) {
                // 单个邮箱重复，跳过
                console.log(`⏭️ 跳过重复邮箱: ${customer.email}`);
                skippedCustomers.push({
                  ...customer,
                  reason: 'database_email_duplicate',
                  details: `邮箱 ${customer.email} 已存在于数据库中`
                });
              } else {
                // 其他错误，记录但不终止
                console.log(`⚠️ 插入失败: ${customer.company_name} - ${singleError.message}`);
                insertErrors.push({
                  type: 'insert_error',
                  message: singleError.message,
                  customer: customer.company_name
                });
              }
            } catch (singleError) {
              // 捕获其他错误，记录但不终止
              console.log(`⚠️ 插入异常: ${customer.company_name} - ${singleError instanceof Error ? singleError.message : '未知错误'}`);
              insertErrors.push({
                type: 'insert_error',
                message: singleError instanceof Error ? singleError.message : '未知错误',
                customer: customer.company_name
              });
            }
          }
        } else {
          // 其他类型的错误，记录但不终止上传
          console.log(`⚠️ 批次 ${batchNumber} 其他错误: ${insertError.message}`);
          insertErrors.push({
            type: 'insert_error',
            message: insertError.message,
            count: batch.length
          });
        }
      } else {
        totalInserted += insertedBatch?.length || 0;
        console.log(`✅ 批次 ${batchNumber} 成功插入 ${insertedBatch?.length || 0} 个客户`);
      }
    }

    const fileDuplicateCount = duplicateRows.length;
    const dbDuplicateCount = skippedCustomers.length;
    const importedCount = totalInserted;
    const totalSkipped = dbDuplicateCount + fileDuplicateCount;

    console.log('🎉 批量上传完成！');
    console.log(`📊 最终统计:`);
    console.log(`   ✅ 成功导入: ${importedCount} 个客户`);
    console.log(`   ⏭️ 文件内重复: ${fileDuplicateCount} 个`);
    console.log(`   ⏭️ 数据库重复: ${dbDuplicateCount} 个`);
    console.log(`   📝 总跳过: ${totalSkipped} 个`);
    console.log(`   ⚠️ 插入错误: ${insertErrors.length} 个`);

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
    
    // 添加插入错误信息
    if (insertErrors.length > 0) {
      const errorTypes = insertErrors.reduce((acc: Record<string, number>, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const errorDetails = [];
      if (errorTypes.email_duplicate) {
        errorDetails.push(`邮箱重复: ${errorTypes.email_duplicate} 个批次`);
      }
      if (errorTypes.insert_error) {
        errorDetails.push(`插入错误: ${errorTypes.insert_error} 个`);
      }
      
      resultMessage += `，插入过程中遇到问题: ${errorDetails.join(', ')}`;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      fileDuplicateCount,
      dbDuplicateCount,
      totalSkipped,
      insertErrors, // 返回插入错误信息
      duplicateRows, // 返回重复行的详细信息
      skippedCustomers, // 返回被跳过的客户信息
      message: resultMessage
    });

  } catch (error) {
    console.error('❌ 批量上传处理失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'PROCESSING_ERROR',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 