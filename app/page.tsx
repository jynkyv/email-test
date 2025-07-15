'use client';

import { useState } from 'react';
import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'view'>('send');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">邮件管理系统</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('send')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'send'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                发送邮件
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                查看邮件
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'send' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">发送邮件</h2>
              <p className="text-sm text-gray-600">支持单发和群发邮件功能</p>
            </div>
            <EmailSender />
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">邮件收件箱</h2>
              <p className="text-sm text-gray-600">查看和搜索收到的邮件</p>
            </div>
            <EmailViewer />
          </div>
        )}
      </main>

      {/* 配置提示 */}
      <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">配置说明</h3>
        <p className="text-xs text-yellow-700">
          请确保在环境变量中配置了以下Google API凭据：
          <br />
          • GOOGLE_CLIENT_ID<br />
          • GOOGLE_CLIENT_SECRET<br />
          • GOOGLE_REFRESH_TOKEN<br />
          • GOOGLE_EMAIL
        </p>
      </div>
    </div>
  );
}
