const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请确保在 .env.local 文件中配置了 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    const adminEmail = 'admin@example.com'; // 你可以修改这个邮箱
    const adminPassword = 'admin123456'; // 你可以修改这个密码

    console.log('正在创建管理员用户...');
    console.log(`邮箱: ${adminEmail}`);
    console.log(`密码: ${adminPassword}`);

    // 创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('创建用户失败:', authError.message);
      return;
    }

    console.log('用户创建成功:', authData.user.id);

    // 在 users 表中添加用户信息
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
      });

    if (insertError) {
      console.error('添加用户信息失败:', insertError.message);
      return;
    }

    console.log('管理员用户创建成功！');
    console.log('请使用以下信息登录:');
    console.log(`邮箱: ${adminEmail}`);
    console.log(`密码: ${adminPassword}`);

  } catch (error) {
    console.error('创建管理员用户失败:', error);
  }
}

createAdminUser(); 