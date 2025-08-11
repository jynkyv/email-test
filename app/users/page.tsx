'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import UserManager from '../components/UserManager';
import AppHeader from '../components/Header';

export default function UsersPage() {
  const { user, loading, userRole } = useAuth();
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

  // 检查管理员权限
  useEffect(() => {
    if (mounted && !loading && user && userRole !== 'admin') {
      // message.error(t('auth.accessDenied')); // Original code had this line commented out
      router.push('/');
    }
  }, [mounted, loading, user, userRole, router, t]);

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

  // 如果不是管理员，显示访问被拒绝
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mt-4">{t('auth.accessDenied')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="p-6">
        <UserManager />
      </div>
    </div>
  );
}
