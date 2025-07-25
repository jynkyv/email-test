require('dotenv').config();

console.log('🔍 SendGrid Inbound Parse 配置检查');
console.log('================================');

console.log('\n📋 需要检查的配置项:');

console.log('\n1. SendGrid Inbound Parse 设置:');
console.log('   - 登录 https://app.sendgrid.com/');
console.log('   - 进入 Settings > Inbound Parse');
console.log('   - 检查是否有以下配置:');
console.log('     Hostname: family-jp.info');
console.log('     URL: https://family-jp.info/api/webhook/email-received');
console.log('     Send raw: 开启');
console.log('     Check for spam: 关闭');

console.log('\n2. DNS MX记录 (已确认正确):');
console.log('   ✅ family-jp.info MX 10 mx.sendgrid.net');

console.log('\n3. Webhook接口检查:');
console.log('   - 运行: node scripts/test-webhook.js');
console.log('   - 检查接口是否可访问');

console.log('\n4. 邮件发送测试:');
console.log('   - 发送邮件到: test@family-jp.info');
console.log('   - 检查SendGrid Activity日志');
console.log('   - 检查服务器日志');

console.log('\n5. 常见问题排查:');

console.log('\n   A. SendGrid账户状态:');
console.log('      - 检查账户是否激活');
console.log('      - 检查是否有发送限制');
console.log('      - 免费账户可能有限制');

console.log('\n   B. 域名配置:');
console.log('      - 确认域名在SendGrid中已验证');
console.log('      - 检查域名是否被暂停');

console.log('\n   C. Webhook配置:');
console.log('      - URL必须是HTTPS');
console.log('      - 服务器必须可公网访问');
console.log('      - 路径必须正确');

console.log('\n   D. 邮件路由:');
console.log('      - 确认邮件确实发送到了family-jp.info');
console.log('      - 检查发件邮箱是否被过滤');

console.log('\n6. 调试步骤:');

console.log('\n   步骤1: 检查SendGrid日志');
console.log('   - 登录SendGrid控制台');
console.log('   - 进入 Activity > Inbound Parse');
console.log('   - 查看是否有邮件接收记录');

console.log('\n   步骤2: 检查服务器日志');
console.log('   - 查看应用日志');
console.log('   - 检查是否有webhook请求');

console.log('\n   步骤3: 测试webhook接口');
console.log('   - 运行测试脚本');
console.log('   - 确认接口响应正常');

console.log('\n   步骤4: 验证邮件路由');
console.log('   - 使用不同邮箱发送测试');
console.log('   - 检查MX记录是否生效');

console.log('\n💡 建议操作:');
console.log('1. 先运行 webhook 测试脚本');
console.log('2. 检查SendGrid控制台日志');
console.log('3. 确认服务器部署状态');
console.log('4. 验证域名配置');

console.log('\n🚨 如果仍然不工作，请提供:');
console.log('- SendGrid Inbound Parse 配置截图');
console.log('- 服务器日志信息');
console.log('- 测试邮件发送详情'); 