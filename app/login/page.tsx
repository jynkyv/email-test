'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);

    try {
      console.log('开始登录流程');
      const { error, data } = await signIn(values.username, values.password);
      
      if (error) {
        console.log('登录失败:', error);
        message.error(error.message || '登录失败，请检查用户名和密码');
      } else {
        console.log('登录成功:', data);
        message.success('登录成功');
        router.push('/');
      }
    } catch (error) {
      console.error('登录异常:', error);
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card 
        title={
          <div className="text-center text-xl font-bold text-gray-800">
            邮件管理系统
          </div>
        }
        className="w-full max-w-md shadow-lg"
      >
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>测试账户: admin (无需密码)</p>
        </div>
      </Card>
    </div>
  );
}
