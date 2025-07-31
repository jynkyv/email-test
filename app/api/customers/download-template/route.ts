import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // 创建示例数据 - 使用日语表头，传真改为FAX
    const templateData = [
      ['会社名', 'E-Mail', 'FAX', '住所'],
      ['正仙法人乙仙会', 'Eメール isuro@micta.ocn.ne.jp', '03-1234-5678', '东京都新宿区西新宿2-8-1'],
      ['示例公司2', 'Eメール example2@company.com', '03-2345-6789', '大阪府大阪市北区梅田1-1-1'],
      ['示例公司3', '', '03-3456-7890', '神奈川县横滨市西区みなとみらい2-2-1'],
      ['示例公司4', 'Eメール example4@company.com', '', '东京都涩谷区涩谷1-1-1']
    ];

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    worksheet['!cols'] = [
      { width: 20 }, // 公司名称列
      { width: 25 }, // 邮箱列
      { width: 15 }, // FAX列
      { width: 30 }  // 地址列
    ];

    // 添加工作表到工作簿 - 使用日语工作表名称
    XLSX.utils.book_append_sheet(workbook, worksheet, '顧客インポートテンプレート');

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // 返回文件
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="customer_import_template.xlsx"',
      },
    });

  } catch (error) {
    console.error('生成模板文件失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '生成模板文件失败' 
    }, { status: 500 });
  }
} 