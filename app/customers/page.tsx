'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import CustomerManager from '../components/CustomerManager';
import AppHeader from '../components/Header';

export default function CustomersPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log('User not logged in, redirecting to login page');
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  // 在客户端挂载之前，显示加载状态
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">{t('auth.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示重定向信息
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin />
          <p className="text-gray-600 mt-4">{t('auth.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="p-6">
        <CustomerManager />
      </div>
    </div>
  );
}
