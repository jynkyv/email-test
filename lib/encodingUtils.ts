// @ts-ignore
import * as encoding from 'encoding-japanese';

/**
 * 检测并转换邮件内容的编码
 * @param content 原始邮件内容
 * @returns 转换后的UTF-8内容
 */
export function decodeEmailContent(content: string): string {
  if (!content) return content;

  console.log('=== decodeEmailContent 开始 ===');
  console.log('输入内容长度:', content.length);
  console.log('输入内容前100字符:', content.substring(0, 100));

  try {
    // 1. 尝试从HTML meta标签检测编码
    const charset = detectCharsetFromHtml(content);
    
    if (charset) {
      console.log('检测到编码:', charset);
      const result = convertToUtf8(content, charset);
      console.log('编码转换结果长度:', result.length);
      console.log('编码转换结果前100字符:', result.substring(0, 100));
      return result;
    }

    // 2. 尝试自动检测编码
    const detectedEncoding = detectEncoding(content);
    if (detectedEncoding) {
      console.log('自动检测到编码:', detectedEncoding);
      const result = convertToUtf8(content, detectedEncoding);
      console.log('编码转换结果长度:', result.length);
      console.log('编码转换结果前100字符:', result.substring(0, 100));
      return result;
    }

    // 3. 如果都检测不到，返回原始内容
    console.log('未检测到特殊编码，返回原始内容');
    return content;
  } catch (error) {
    console.error('编码转换失败:', error);
    return content;
  }
}

/**
 * 从HTML meta标签检测字符集
 */
function detectCharsetFromHtml(html: string): string | null {
  const charsetPatterns = [
    /<meta[^>]*charset\s*=\s*["']?([^"'>\s]+)/i,
    /<meta[^>]*content\s*=\s*["'][^"']*charset\s*=\s*([^"'>\s]+)/i,
    /Content-Type:\s*[^;]*;\s*charset\s*=\s*["']?([^"'>\s]+)/i
  ];

  for (const pattern of charsetPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
}

/**
 * 自动检测编码
 */
function detectEncoding(content: string): string | null {
  // 检查是否包含ISO-2022-JP特征
  if (content.includes('$B') && content.includes('$B')) {
    return 'ISO-2022-JP';
  }

  // 检查是否包含Shift_JIS特征
  if (content.includes('¥') || content.includes('\\')) {
    return 'Shift_JIS';
  }

  // 检查是否包含EUC-JP特征
  if (content.includes('｢') || content.includes('｣')) {
    return 'EUC-JP';
  }

  return null;
}

/**
 * 将内容转换为UTF-8
 */
function convertToUtf8(content: string, fromEncoding: string): string {
  try {
    console.log('开始编码转换:', fromEncoding, '内容长度:', content.length);
    
    // 将字符串转换为字节数组
    const bytes = encoding.stringToCode(content);
    console.log('字节数组长度:', bytes.length);
    
    // 根据编码类型进行转换
    let convertedBytes: number[];
    
    switch (fromEncoding.toLowerCase()) {
      case 'iso-2022-jp':
      case 'iso2022jp':
        convertedBytes = encoding.convert(bytes, {
          from: 'ISO2022JP',
          to: 'UNICODE'
        });
        break;
        
      case 'shift_jis':
      case 'shift-jis':
      case 'sjis':
        convertedBytes = encoding.convert(bytes, {
          from: 'SJIS',
          to: 'UNICODE'
        });
        break;
        
      case 'euc-jp':
      case 'eucjp':
        convertedBytes = encoding.convert(bytes, {
          from: 'EUCJP',
          to: 'UNICODE'
        });
        break;
        
      case 'utf-8':
      case 'utf8':
        return content; // 已经是UTF-8
        
      default:
        console.warn('不支持的编码:', fromEncoding);
        return content;
    }
    
    console.log('转换后字节数组长度:', convertedBytes.length);
    
    // 将转换后的字节数组转回字符串
    const result = encoding.codeToString(convertedBytes);
    console.log('转换结果长度:', result.length);
    console.log('转换结果前100字符:', result.substring(0, 100));
    
    return result;
    
  } catch (error) {
    console.error('编码转换失败:', error);
    return content;
  }
}

/**
 * 清理HTML内容，移除不必要的标签和样式
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return html;

  // 移除Word特定的样式和标签
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 移除样式标签
    .replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '') // 移除Word特定标签
    .replace(/<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '') // 移除Word命名空间标签
    .replace(/<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '') // 移除Math命名空间标签
    .replace(/xmlns:[^=]*="[^"]*"/gi, '') // 移除命名空间声明
    .replace(/class="[^"]*"/gi, '') // 移除class属性
    .replace(/style="[^"]*"/gi, '') // 移除style属性
    .replace(/<div[^>]*>/gi, '') // 移除div开始标签
    .replace(/<\/div>/gi, '') // 移除div结束标签
    .replace(/<p[^>]*>/gi, '') // 移除p开始标签
    .replace(/<\/p>/gi, '\n') // 将p结束标签替换为换行
    .replace(/<br[^>]*>/gi, '\n') // 将br标签替换为换行
    .replace(/&nbsp;/gi, ' ') // 替换&nbsp;
    .replace(/&lt;/gi, '<') // 替换&lt;
    .replace(/&gt;/gi, '>') // 替换&gt;
    .replace(/&amp;/gi, '&') // 替换&amp;
    .replace(/&quot;/gi, '"') // 替换&quot;
    .replace(/\n\s*\n/g, '\n') // 移除多余的空行
    .trim();

  return cleaned;
}

/**
 * 处理HTML邮件内容（只进行编码转换，不清理HTML）
 * @param content 原始邮件内容
 * @returns 编码转换后的HTML内容
 */
export function processHtmlEmailContent(content: string): string {
  if (!content) return content;

  // 只进行编码转换，不清理HTML标签
  return decodeEmailContent(content);
}

/**
 * 完整的邮件内容处理函数
 * @param content 原始邮件内容
 * @param cleanHtml 是否清理HTML标签，默认为true
 * @returns 处理后的内容
 */
export function processEmailContent(content: string, cleanHtml: boolean = true): string {
  if (!content) return content;

  // 1. 先进行编码转换
  const decodedContent = decodeEmailContent(content);
  
  // 2. 如果是HTML内容且需要清理，进行清理
  if (cleanHtml && decodedContent.includes('<') && decodedContent.includes('>')) {
    return cleanHtmlContent(decodedContent);
  }
  
  return decodedContent;
}

/**
 * 测试编码处理函数
 */
export function testEncodingProcessing() {
  const testContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40"> <head> <meta http-equiv="Content-Type" content="text/html; charset=iso-2022-jp"> <meta name="Generator" content="Microsoft Word 14 (filtered medium)"> <style><!-- /* Font Definitions */ @font-face {font-family:"MS UI Gothic"; panose-1:2 11 6 0 7 2 5 8 2 4;} @font-face {font-family:"$B#M#S$B $B#P%4%7%C%/$B"; panose-1:2 11 6 0 7 2 5 8 2 4;} @font-face {font-family:"\@$B#M#S$B $B#P%4%7%C%/$B"; panose-1:2 11 6 0 7 2 5 8 2 4;} @font-face {font-family:"\@MS UI Gothic"; panose-1:2 11 6 0 7 2 5 8 2 4;} /* Style Definitions */ p.MsoNormal, li.MsoNormal, div.MsoNormal {margin:0mm; margin-bottom:.0001pt; text-align:justify; text-justify:inter-ideograph; font-size:10.5pt; font-family:"Arial","sans-serif";} a:link, span.MsoHyperlink {mso-style-priority:99; color:blue; text-decoration:underline;} a:visited, span.MsoHyperlinkFollowed {mso-style-priority:99; color:purple; text-decoration:underline;} span.17 {mso-style-type:personal-compose; font-family:"$B#M#S$B $B#P%4%7%C%/$B";} .MsoChpDefault {mso-style-type:export-only; font-family:"Arial","sans-serif";} /* Page Definitions */ @page WordSection1 {size:612.0pt 792.0pt; margin:99.25pt 30.0mm 30.0mm 30.0mm;} div.WordSection1 {page:WordSection1;} --></style> </head> <body lang="JA" link="blue" vlink="purple" style="text-justify-trim:punctuation"> <div class="WordSection1"> <p class="MsoNormal" align="left" style="text-align:left;text-autospace:none"><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$B$4O"Mm$$$?$@$-$^$7$F!"$"$j$,$H$&$4$6$$$^$9!#$B<span lang="EN-US"> <o:p></o:p></span></span></p> <p class="MsoNormal" align="left" style="text-align:left;text-autospace:none"><span lang="EN-US" style="font-size:10.0pt">8</span><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$B7n$B</span><span lang="EN-US" style="font-size:10.0pt">13</span><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$BF|8a8e$OIT:_$N$?$a!"$B</span><span lang="EN-US" style="font-size:10.0pt">8</span><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$B7n$B</span><span lang="EN-US" style="font-size:10.0pt">18</span><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$BF|$K%a!<%k$NFbMF$r3NG'$5$;$F$$$?$@$-$^$9!#$B<span lang="EN-US"> <o:p></o:p></span></span></p> <p class="MsoNormal" align="left" style="text-align:left;text-autospace:none"><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$B59$7$/$*4j$$CW$7$^$9!#$B<span lang="EN-US"> <o:p></o:p></span></span></p> <p class="MsoNormal" align="left" style="text-align:left;text-autospace:none"><span lang="EN-US" style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B"><o:p>&nbsp;</o:p></span></p> <p class="MsoNormal" align="left" style="text-align:left;text-autospace:none"><span style="font-size:10.0pt;font-family:"$B#M#S$B $B#P%4%7%C%/$B">$B0BC#$B</span><span style="font-size:9.0pt;font-family:"MS UI Gothic"><o:p></o:p></span></p> </div> </body> </html>`;

  console.log('=== 编码处理测试 ===');
  console.log('原始内容长度:', testContent.length);
  
  // 测试HTML内容处理
  const htmlResult = processHtmlEmailContent(testContent);
  console.log('HTML处理结果长度:', htmlResult.length);
  console.log('HTML处理结果前200字符:', htmlResult.substring(0, 200));
  
  // 测试文本内容处理
  const textResult = processEmailContent(testContent, true);
  console.log('文本处理结果长度:', textResult.length);
  console.log('文本处理结果前200字符:', textResult.substring(0, 200));
  
  return { htmlResult, textResult };
}


