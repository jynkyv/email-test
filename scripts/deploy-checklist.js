#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel 部署检查清单\n');

// 检查必需文件
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  '.gitignore',
  'README.md',
  'app/layout.tsx',
  'app/page.tsx'
];

console.log('📁 检查必需文件:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// 检查 package.json
console.log('\n📦 检查 package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 检查必需依赖
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'antd',
    'googleapis',
    'nodemailer'
  ];
  
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  requiredDeps.forEach(dep => {
    const exists = deps[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
    if (!exists) allFilesExist = false;
  });
  
  // 检查脚本
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    const exists = packageJson.scripts[script];
    console.log(`  ${exists ? '✅' : '❌'} script: ${script}`);
    if (!exists) allFilesExist = false;
  });
  
} catch (error) {
  console.log('  ❌ package.json 解析失败');
  allFilesExist = false;
}

// 检查环境变量
console.log('\n🔧 检查环境变量配置:');
const envExample = fs.existsSync('env.example') ? fs.readFileSync('env.example', 'utf8') : '';
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_EMAIL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_BASE_URL'
];

requiredEnvVars.forEach(envVar => {
  const exists = envExample.includes(envVar);
  console.log(`  ${exists ? '✅' : '❌'} ${envVar}`);
  if (!exists) allFilesExist = false;
});

// 检查 API 路由
console.log('\n🔌 检查 API 路由:');
const apiRoutes = [
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/customers/route.ts',
  'app/api/email/route.ts',
  'app/api/users/route.ts',
  'app/api/users/update-stats/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(route);
  console.log(`  ${exists ? '✅' : '❌'} ${route}`);
  if (!exists) allFilesExist = false;
});

// 检查组件
console.log('\n🧩 检查组件:');
const components = [
  'app/components/EmailSender.tsx',
  'app/components/EmailViewer.tsx',
  'app/components/CustomerManager.tsx',
  'app/components/UserManager.tsx'
];

components.forEach(component => {
  const exists = fs.existsSync(component);
  console.log(`  ${exists ? '✅' : '❌'} ${component}`);
  if (!exists) allFilesExist = false;
});

// 检查翻译文件
console.log('\n🌐 检查翻译文件:');
const locales = [
  'locales/zh.json',
  'locales/ja.json'
];

locales.forEach(locale => {
  const exists = fs.existsSync(locale);
  console.log(`  ${exists ? '✅' : '❌'} ${locale}`);
  if (!exists) allFilesExist = false;
});

// 总结
console.log('\n📋 部署准备总结:');
if (allFilesExist) {
  console.log('✅ 所有必需文件都存在，可以开始部署！');
  console.log('\n📝 下一步:');
  console.log('1. 确保代码已提交到 GitHub');
  console.log('2. 准备所有环境变量');
  console.log('3. 在 Supabase 中执行数据库脚本');
  console.log('4. 更新 Google OAuth2 配置');
  console.log('5. 在 Vercel 中部署项目');
} else {
  console.log('❌ 发现缺失的文件或配置，请先修复这些问题再部署');
}

console.log('\n📖 详细部署指南请查看: VERCEL_DEPLOYMENT.md'); 