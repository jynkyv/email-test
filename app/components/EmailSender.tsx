'use client';

import { useState, useEffect } from 'react';

interface ReplyData {
  to: string;
  subject: string;
  content: string;
}

interface EmailSenderProps {
  replyData?: ReplyData | null;
  onSendComplete?: () => void;
}

export default function EmailSender({ replyData, onSendComplete }: EmailSenderProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [sentEmails, setSentEmails] = useState(0);

  // 当收到回信数据时，自动填充表单
  useEffect(() => {
    if (replyData) {
      setTo(replyData.to);
      setSubject(replyData.subject);
      setHtml(replyData.content);
    }
  }, [replyData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to.trim() || !subject.trim() || !html.trim()) {
      alert('请填写所有必填字段');
      return;
    }

    setIsSending(true);
    setProgress(0);
    setSentEmails(0);

    // 解析收件人列表
    const recipients = to
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    setTotalEmails(recipients.length);

    if (recipients.length === 0) {
      alert('请输入有效的邮箱地址');
      setIsSending(false);
      return;
    }

    // 逐个发送邮件
    for (let i = 0; i < recipients.length; i++) {
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipients[i],
            subject,
            html,
            customLabel,
            isBulk: true
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setSentEmails(prev => prev + 1);
        }
        
        // 更新进度
        setProgress(((i + 1) / recipients.length) * 100);
        
        // 等待3秒再发送下一封
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error('发送邮件失败:', error);
      }
    }

    setIsSending(false);
    setProgress(0);
    setSentEmails(0);
    setTotalEmails(0);
    
    // 清空表单
    setTo('');
    setSubject('');
    setHtml('');
    setCustomLabel('');
    
    // 通知父组件发送完成
    onSendComplete?.();
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">群发邮件</h2>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3">
        {/* 收件人列表 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            收件人列表
          </label>
          <textarea
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email1@example.com, email2@example.com, email3@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
            rows={2}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            支持中英文逗号分隔，每行一个邮箱，或用逗号分隔。系统将逐个发送邮件给每个收件人，间隔3秒避免被判定为垃圾邮件。
          </p>
        </div>

        {/* 邮件主题和标签行 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮件主题
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="邮件主题 (支持中文、日文等)"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自定义标签
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="例如: Campaign-2024-01, VIP-Customers, 产品推广"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>
        </div>

        {/* 邮件内容 - 占据大部分空间 */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮件内容
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="请输入邮件内容... (支持中文、日文等)"
            className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
            required
          />
        </div>

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? '发送中...' : '开始群发邮件'}
        </button>
      </form>

      {/* 发送进度 */}
      {isSending && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>发送进度</span>
            <span>{sentEmails}/{totalEmails}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            每3秒发送一封邮件，避免被判定为垃圾邮件
          </p>
        </div>
      )}
    </div>
  );
} 