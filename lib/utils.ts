/**
 * 将HTML转换为纯文本，保留格式
 * @param html HTML字符串
 * @returns 转换后的纯文本
 */
export const htmlToText = (html: string): string => {
  if (!html) return '';
  
  // 处理常见的HTML标签，保留格式
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // 移除所有style标签及其内容
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // 移除所有script标签及其内容
    .replace(/<p[^>]*>/gi, '')  // 移除<p>开始标签
    .replace(/<\/p>/gi, '\n\n')  // 将</p>标签转换为双换行
    .replace(/<br\s*\/?>/gi, '\n')  // 将<br>标签转换为换行
    .replace(/<div[^>]*>/gi, '')  // 移除<div>开始标签
    .replace(/<\/div>/gi, '\n')  // 将</div>标签转换为换行
    .replace(/<h[1-6][^>]*>/gi, '\n')  // 将标题标签转换为换行
    .replace(/<\/h[1-6]>/gi, '\n\n')  // 将标题结束标签转换为双换行
    .replace(/<li[^>]*>/gi, '\n• ')  // 将列表项转换为换行加项目符号
    .replace(/<\/li>/gi, '')  // 移除列表项结束标签
    .replace(/<ul[^>]*>/gi, '\n')  // 将无序列表转换为换行
    .replace(/<\/ul>/gi, '\n')  // 将无序列表结束标签转换为换行
    .replace(/<ol[^>]*>/gi, '\n')  // 将有序列表转换为换行
    .replace(/<\/ol>/gi, '\n')  // 将有序列表结束标签转换为换行
    .replace(/<[^>]*>/g, '')  // 移除所有其他HTML标签
    .replace(/&nbsp;/g, ' ')  // 将&nbsp;转换为空格
    .replace(/&amp;/g, '&')  // 将&amp;转换为&
    .replace(/&lt;/g, '<')  // 将&lt;转换为<
    .replace(/&gt;/g, '>')  // 将&gt;转换为>
    .replace(/&quot;/g, '"')  // 将&quot;转换为"
    .replace(/&#39;/g, "'")  // 将&#39;转换为'
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // 清理多余的空行
    .trim();
  
  return text;
};

/**
 * 将纯文本转换为HTML格式
 * @param text 纯文本字符串
 * @returns 转换后的HTML字符串
 */
export const textToHtml = (text: string): string => {
  if (!text) return '';
  
  return text
    .split('\n')  // 按换行符分割
    .map(line => line.trim())  // 清理每行的首尾空格
    .filter(line => line.length > 0)  // 过滤空行
    .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)  // 将每行包装在<p>标签中
    .join('');
}; 