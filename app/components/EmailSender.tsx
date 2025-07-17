'use client';

import { useState } from 'react';

interface EmailSenderProps {
  onSendSuccess?: () => void;
}

export default function EmailSender({ onSendSuccess }: EmailSenderProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showSuccess, setShowSuccess] = useState(false);

  // 解析邮箱列表，支持中英文逗号
  const parseEmailList = (emailString: string) => {
    return emailString
      .split(/[,，]/) // 支持中文逗号和英文逗号
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 解析邮箱列表
      const emailList = parseEmailList(to);
      
      if (emailList.length === 0) {
        return;
      }

      setProgress({ current: 0, total: emailList.length });

      let successCount = 0;
      let failCount = 0;

      // 队列式发送邮件
      for (let i = 0; i < emailList.length; i++) {
        const email = emailList[i];
        
        try {
          console.log(`正在发送邮件给: ${email} (${i + 1}/${emailList.length})`);

          const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              to: [email], // 每次只发送给一个收件人
              subject,
              html: content,
              isBulk: false, // 虽然是群发，但每次只发送给一个人
            }),
          });

          const data = await response.json();

          if (data.success) {
            successCount++;
            console.log(`✅ 邮件发送成功: ${email}`);
          } else {
            failCount++;
            console.error(`❌ 邮件发送失败: ${email} - ${data.error}`);
          }

          // 更新进度
          setProgress({ current: i + 1, total: emailList.length });

          // 添加延迟，避免发送过快被判定为垃圾邮件
          if (i < emailList.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3秒延迟
          }

        } catch (error) {
          failCount++;
          console.error(`❌ 发送邮件给 ${email} 时出错:`, error);
        }
      }

      // 发送完成
      if (successCount === emailList.length) {
        setTo('');
        setSubject('');
        setContent('');
        onSendSuccess?.();
        
        // 显示成功通知，5秒后关闭
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }

    } catch (error) {
      console.error('发送邮件错误:', error);
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">群发邮件</h2>
      
      {/* 进度通知 - 胶囊形状 */}
      {isLoading && progress.total > 0 && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white border border-gray-200 rounded-full shadow-xl px-8 py-4 flex items-center space-x-4 backdrop-blur-sm">
            {/* 进度图标 */}
            <div className="flex-shrink-0">
              <div className="w-7 h-7 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            
            {/* 进度文本 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                正在发送邮件...
              </div>
              <div className="text-xs text-gray-500">
                {progress.current} / {progress.total}
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="flex-shrink-0 w-28">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功通知 */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-50 border border-green-200 rounded-full shadow-xl px-8 py-4 flex items-center space-x-3 backdrop-blur-sm">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-semibold text-green-800">
              邮件发送成功！
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSend} className="space-y-6">
        {/* 收件人列表 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            收件人列表
          </label>
          <textarea
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email1@example.com, email2@example.com，email3@example.com"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 resize-vertical transition-all duration-200"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            支持中英文逗号分隔，每行一个邮箱，或用逗号分隔。系统将逐个发送邮件给每个收件人，间隔3秒避免被判定为垃圾邮件。
          </p>
        </div>

        {/* 主题 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            邮件主题
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="邮件主题 (支持中文、日文等)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
            required
            lang="ja"
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            邮件内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入邮件内容... (支持中文、日文等)"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 resize-vertical transition-all duration-200"
            required
            lang="ja"
          />
        </div>

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
        >
          {isLoading ? '发送中...' : '开始群发邮件'}
        </button>
      </form>
    </div>
  );
} 