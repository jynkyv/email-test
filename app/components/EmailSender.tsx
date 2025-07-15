'use client';

import { useState } from 'react';

interface EmailSenderProps {
  onSendSuccess?: () => void;
}

export default function EmailSender({ onSendSuccess }: EmailSenderProps) {
  const [isBulk, setIsBulk] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const emailList = isBulk 
        ? to.split(',').map(email => email.trim()).filter(email => email)
        : [to];

      console.log('发送邮件数据:', { to: emailList, subject, html: content, isBulk });

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailList,
          subject,
          html: content,
          isBulk,
        }),
      });

      console.log('API响应状态:', response.status);
      const data = await response.json();
      console.log('API响应数据:', data);

      if (data.success) {
        setMessage('邮件发送成功！');
        setTo('');
        setSubject('');
        setContent('');
        onSendSuccess?.();
      } else {
        setMessage(`发送失败: ${data.error}`);
      }
    } catch (error) {
      console.error('发送邮件错误:', error);
      setMessage('发送失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">发送邮件</h2>
      
      <form onSubmit={handleSend} className="space-y-4">
        {/* 发送模式选择 */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={!isBulk}
              onChange={() => setIsBulk(false)}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">单发邮件</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={isBulk}
              onChange={() => setIsBulk(true)}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">群发邮件</span>
          </label>
        </div>

        {/* 收件人 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isBulk ? '收件人列表 (用逗号分隔)' : '收件人'}
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={isBulk ? "email1@example.com, email2@example.com" : "email@example.com"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        {/* 主题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主题
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="邮件主题"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮件内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入邮件内容..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-vertical"
            required
          />
        </div>

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '发送中...' : '发送邮件'}
        </button>

        {/* 消息提示 */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('成功') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
} 