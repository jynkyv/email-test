'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';
import AppHeader from './components/Header';

interface ReplyData {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
}

export default function Home() {
  const [replyData, setReplyData] = useState<ReplyData | null>(null);
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReply = (emailData: ReplyData) => {
    setReplyData(emailData);
  };

  const handleSendComplete = () => {
    setReplyData(null);
  };

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

  // 如果用户未登录，提示使用 URL 参数登录
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm border border-gray-100 max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">未检测到登录身份</h2>
          <p className="text-gray-600 mb-6">
            系统已切换为 URL 参数登录模式。请在请求地址后添加 <code>?account=你的用户名</code> 以访问系统。
          </p>
          <div className="bg-gray-200 p-3 rounded text-sm text-left text-gray-700 font-mono overflow-x-auto">
            示例: https://.../?account=admin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 ">
            <EmailSender
              replyData={replyData}
              onSendComplete={handleSendComplete}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 ">
            <EmailViewer onReply={handleReply} />
          </div>
        </div>
      </div>
    </div>
  );
}
