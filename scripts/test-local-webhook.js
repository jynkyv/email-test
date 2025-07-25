const http = require('http');

console.log('🧪 本地Webhook测试');
console.log('================');

// 测试本地开发服务器
const testLocalServer = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook/email-received',
    method: 'GET'
  };

  console.log('测试本地服务器:', `http://localhost:3000/api/webhook/email-received`);

  const req = http.request(options, (res) => {
    console.log('状态码:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('响应内容:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ 本地webhook接口可访问');
        console.log('\n💡 下一步:');
        console.log('1. 启动本地服务器: pnpm dev');
        console.log('2. 使用ngrok创建HTTPS隧道');
        console.log('3. 配置SendGrid使用ngrok URL');
      } else {
        console.log('❌ 本地webhook接口返回错误状态码');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 连接失败:', error.message);
    console.log('\n💡 请先启动本地服务器:');
    console.log('pnpm dev');
  });

  req.end();
};

// 测试ngrok（如果已安装）
const testNgrok = () => {
  console.log('\n🌐 测试ngrok...');
  
  const { exec } = require('child_process');
  exec('ngrok http 3000', (error, stdout, stderr) => {
    if (error) {
      console.log('ngrok未安装或未运行');
      console.log('安装ngrok: npm install -g ngrok');
      console.log('运行ngrok: ngrok http 3000');
    } else {
      console.log('ngrok输出:', stdout);
    }
  });
};

// 运行测试
testLocalServer();

console.log('\n📋 部署检查清单:');
console.log('1. ✅ 本地开发服务器运行');
console.log('2. 🔄 安装并运行ngrok');
console.log('3. 🔄 获取ngrok HTTPS URL');
console.log('4. 🔄 配置SendGrid Inbound Parse');
console.log('5. 🔄 测试邮件接收');

console.log('\n🚀 快速启动命令:');
console.log('# 终端1: 启动开发服务器');
console.log('pnpm dev');
console.log('');
console.log('# 终端2: 启动ngrok隧道');
console.log('ngrok http 3000');
console.log('');
console.log('# 然后使用ngrok提供的HTTPS URL配置SendGrid'); 