export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
}

// 预定义的邮件模板 - 使用默认邮件模板内容
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'default',
    name: '默认邮件模板',
    subject: '【初期費用0円】技能実習生受け入れキャンペーン!',
    content:'',
    description: '使用默认的邮件模板，包含完整的HTML结构和图片',
    category: 'default'
  }
]; 