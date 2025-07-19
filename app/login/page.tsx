'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { signIn, user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push('/');
    }
  }, [mounted, user, router]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const success = await signIn(values.username, values.password);
      if (success) {
        message.success(t('auth.loginSuccess'));
        router.push('/');
      } else {
        message.error(t('auth.loginFailed'));
      }
    } catch (error) {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">{t('auth.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('navigation.emailSystem')}
            </h1>
            <p className="text-gray-600">{t('auth.signIn')}</p>
          </div>

        <Form
            form={form}
          onFinish={handleSubmit}
          layout="vertical"
            size="large"
        >
          <Form.Item
            name="username"
              rules={[{ required: true, message: t('auth.usernameRequired') }]}
          >
            <Input
              prefix={<UserOutlined />}
                placeholder={t('auth.username')}
                autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
              rules={[{ required: true, message: t('auth.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
                placeholder={t('auth.password')}
                autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
                block
              size="large"
            >
                {t('auth.signIn')}
            </Button>
          </Form.Item>
        </Form>
        </Card>
        </div>
    </div>
  );
}
