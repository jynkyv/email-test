export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
}

// 预定义的邮件模板
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: '欢迎邮件',
    subject: '欢迎加入我们的大家庭！',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50; margin-bottom: 20px;">欢迎加入我们的大家庭！</h2>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">尊敬的客户，</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">感谢您选择我们的服务！我们很高兴能够为您提供优质的产品和服务。</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">如果您有任何问题或需要帮助，请随时联系我们。</p>
  <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0; color: #2c3e50;"><strong>联系方式：</strong></p>
    <p style="margin: 5px 0; color: #34495e;">电话：400-123-4567</p>
    <p style="margin: 5px 0; color: #34495e;">邮箱：support@company.com</p>
  </div>
  <p style="color: #34495e; line-height: 1.6; margin-top: 20px;">再次感谢您的信任！</p>
  <p style="color: #34495e; line-height: 1.6;">祝您生活愉快！</p>
</div>`,
    description: '用于新客户欢迎的邮件模板',
    category: 'welcome'
  },
  {
    id: 'promotion',
    name: '促销活动',
    subject: '限时优惠活动 - 不要错过！',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #e74c3c; margin-bottom: 20px;"> 限时优惠活动 🎉</h2>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">尊敬的客户，</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">我们为您准备了特别的优惠活动！</p>
  <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="color: #856404; margin-bottom: 10px;">特别优惠</h3>
    <p style="color: #856404; font-size: 18px; font-weight: bold; margin: 10px 0;">全场8折优惠</p>
    <p style="color: #856404; margin: 5px 0;">活动时间：2024年1月1日 - 2024年1月31日</p>
  </div>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">立即行动，享受优惠！</p>
  <p style="color: #34495e; line-height: 1.6;">感谢您的支持！</p>
</div>`,
    description: '用于促销活动的邮件模板',
    category: 'promotion'
  },
  {
    id: 'newsletter',
    name: '新闻资讯',
    subject: '本月最新资讯 - 值得关注！',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50; margin-bottom: 20px;">📰 本月最新资讯</h2>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">尊敬的客户，</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">以下是本月的重要资讯：</p>
  
  <div style="border-left: 4px solid #3498db; padding-left: 15px; margin: 20px 0;">
    <h3 style="color: #2c3e50; margin-bottom: 10px;">📈 行业动态</h3>
    <p style="color: #34495e; line-height: 1.6; margin-bottom: 10px;">最新行业趋势分析报告已发布，包含市场预测和投资建议。</p>
  </div>
  
  <div style="border-left: 4px solid #27ae60; padding-left: 15px; margin: 20px 0;">
    <h3 style="color: #2c3e50; margin-bottom: 10px;">🆕 产品更新</h3>
    <p style="color: #34495e; line-height: 1.6; margin-bottom: 10px;">我们的产品线进行了重大更新，新增多项功能特性。</p>
  </div>
  
  <div style="border-left: 4px solid #e74c3c; padding-left: 15px; margin: 20px 0;">
    <h3 style="color: #2c3e50; margin-bottom: 10px;">🎯 客户案例</h3>
    <p style="color: #34495e; line-height: 1.6; margin-bottom: 10px;">分享成功客户案例，展示我们的服务价值。</p>
  </div>
  
  <p style="color: #34495e; line-height: 1.6; margin-top: 20px;">感谢您的关注！</p>
</div>`,
    description: '用于发送新闻资讯的邮件模板',
    category: 'newsletter'
  },
  {
    id: 'reminder',
    name: '提醒通知',
    subject: '重要提醒 - 请及时处理',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #e67e22; margin-bottom: 20px;">⚠️ 重要提醒</h2>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">尊敬的客户，</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">我们注意到您有一项重要事项需要处理：</p>
  
  <div style="background-color: #fff5f5; border: 2px solid #f56565; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #c53030; margin-bottom: 15px;">待处理事项</h3>
    <ul style="color: #2d3748; line-height: 1.6; margin: 0; padding-left: 20px;">
      <li>请确认您的账户信息</li>
      <li>更新您的联系方式</li>
      <li>查看最新的服务条款</li>
    </ul>
  </div>
  
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">请尽快处理以上事项，以确保您的账户安全和服务正常。</p>
  <p style="color: #34495e; line-height: 1.6;">如有疑问，请联系我们的客服团队。</p>
</div>`,
    description: '用于发送重要提醒的邮件模板',
    category: 'reminder'
  },
  {
    id: 'survey',
    name: '满意度调查',
    subject: '您的反馈对我们很重要',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50; margin-bottom: 20px;">📊 满意度调查</h2>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">尊敬的客户，</p>
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">感谢您使用我们的服务！您的反馈对我们非常重要，帮助我们持续改进服务质量。</p>
  
  <div style="background-color: #f7fafc; border: 2px solid #4299e1; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h3 style="color: #2b6cb0; margin-bottom: 15px;">请参与我们的调查</h3>
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 15px;">您的意见将帮助我们：</p>
    <ul style="color: #4a5568; line-height: 1.6; margin: 0; text-align: left; display: inline-block;">
      <li>改进产品功能</li>
      <li>优化用户体验</li>
      <li>提供更好的服务</li>
    </ul>
  </div>
  
  <p style="color: #34495e; line-height: 1.6; margin-bottom: 15px;">调查仅需3-5分钟，您的参与对我们意义重大！</p>
  <p style="color: #34495e; line-height: 1.6;">感谢您的支持！</p>
</div>`,
    description: '用于发送满意度调查的邮件模板',
    category: 'survey'
  }
]; 