const https = require('https');
const http = require('http');

console.log('🔍 测试Webhook可访问性');
console.log('====================');

const webhookUrl = 'https://family-jp.info/api/webhook/email-received';

console.log('测试URL:', webhookUrl);

// 创建测试数据
const testData = {
  from: 'test@example.com',
  to: 'customer@family-jp.info',
  subject: '测试邮件',
  text: '这是一封测试邮件',
  html: '<p>这是一封测试邮件</p>',
  'message-id': 'test-message-id-123'
};

// 将数据转换为form-data格式
const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
let body = '';

for (const [key, value] of Object.entries(testData)) {
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
  body += `${value}\r\n`;
}
body += `--${boundary}--\r\n`;

const options = {
  hostname: 'family-jp.info',
  port: 443,
  path: '/api/webhook/email-received',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(body),
    'User-Agent': 'SendGrid-Inbound-Parse/1.0'
  }
};

console.log('发送测试请求...');

const req = https.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应内容:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook接口可访问');
    } else {
      console.log('❌ Webhook接口返回错误状态码');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('域名解析失败，请检查域名是否正确');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('连接被拒绝，请检查服务器是否运行');
  } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    console.log('SSL证书问题，请检查HTTPS配置');
  }
});

req.write(body);
req.end();

console.log('\n💡 如果测试失败，请检查:');
console.log('1. 服务器是否正在运行');
console.log('2. 域名是否正确解析');
console.log('3. HTTPS证书是否有效');
console.log('4. 防火墙是否允许443端口');
console.log('5. 应用是否部署到正确的路径'); 