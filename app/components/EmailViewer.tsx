'use client';

import { useState, useEffect } from 'react';

interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      body: {
        data?: string;
      };
    }>;
  };
}

export default function EmailViewer() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email?q=${searchQuery}&maxResults=20`);
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.messages);
      }
    } catch (error) {
      console.error('获取邮件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [searchQuery]);

  const getHeaderValue = (headers: Array<{name: string, value: string}>, name: string) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  const decodeEmailContent = (data: string) => {
    try {
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch {
      return data;
    }
  };

  const getEmailContent = (email: Email) => {
    if (email.payload.body?.data) {
      return decodeEmailContent(email.payload.body.data);
    }
    
    if (email.payload.parts) {
      for (const part of email.payload.parts) {
        if (part.body?.data) {
          return decodeEmailContent(part.body.data);
        }
      }
    }
    
    return email.snippet;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* 搜索栏 */}
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索邮件..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '加载中...' : '刷新'}
            </button>
          </div>
        </div>

        <div className="flex h-96">
          {/* 邮件列表 */}
          <div className="w-1/3 border-r overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="font-semibold text-sm">
                  {getHeaderValue(email.payload.headers, 'from')}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {getHeaderValue(email.payload.headers, 'subject')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(email.id)}
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {email.snippet}
                </div>
              </div>
            ))}
            {emails.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">
                暂无邮件
              </div>
            )}
          </div>

          {/* 邮件详情 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedEmail ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">
                    {getHeaderValue(selectedEmail.payload.headers, 'subject')}
                  </h2>
                  <div className="text-sm text-gray-600">
                    <div>发件人: {getHeaderValue(selectedEmail.payload.headers, 'from')}</div>
                    <div>收件人: {getHeaderValue(selectedEmail.payload.headers, 'to')}</div>
                    <div>时间: {formatDate(selectedEmail.id)}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {getEmailContent(selectedEmail)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                请选择一封邮件查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 