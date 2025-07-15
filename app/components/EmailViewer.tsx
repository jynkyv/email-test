'use client';

import { useState, useEffect } from 'react';

interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate?: string;
  historyId?: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
      size?: number;
    };
    parts?: Array<{
      partId: string;
      mimeType: string;
      body: {
        data?: string;
        size?: number;
      };
    }>;
    mimeType?: string;
    filename?: string;
    sizeEstimate?: number;
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
    try {
      const date = new Date(parseInt(dateString));
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '未知时间';
    }
  };

  const getLabelDisplay = (labelIds: string[]) => {
    const labelMap: { [key: string]: string } = {
      'UNREAD': '未读',
      'INBOX': '收件箱',
      'SENT': '已发送',
      'IMPORTANT': '重要',
      'CATEGORY_PERSONAL': '个人',
      'CATEGORY_UPDATES': '更新',
      'CATEGORY_PROMOTIONS': '推广',
      'CATEGORY_SOCIAL': '社交',
      'TRASH': '垃圾箱',
      'SPAM': '垃圾邮件'
    };

    return labelIds
      .filter(label => labelMap[label])
      .map(label => labelMap[label])
      .join(', ');
  };

  const isUnread = (labelIds: string[]) => {
    return labelIds.includes('UNREAD');
  };

  const getSenderName = (from: string) => {
    // 提取邮箱地址前的名称
    const match = from.match(/^"?([^"<]+)"?\s*<?([^>]+)>?$/);
    if (match) {
      return match[1].trim();
    }
    return from;
  };

  const getEmailAddress = (from: string) => {
    // 提取邮箱地址
    const match = from.match(/<(.+?)>/);
    if (match) {
      return match[1];
    }
    return from;
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
          <div className="w-1/3 border-r overflow-y-auto bg-white">
            {emails.map((email) => {
              const from = getHeaderValue(email.payload.headers, 'from');
              const subject = getHeaderValue(email.payload.headers, 'subject');
              const senderName = getSenderName(from);
              const emailAddress = getEmailAddress(from);
              const date = email.internalDate ? formatDate(email.internalDate) : formatDate(email.id);
              
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  } ${isUnread(email.labelIds) ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-sm text-gray-900 truncate flex-1">
                      {senderName}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {date}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 truncate font-medium mb-1">
                    {subject || '(无主题)'}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {emailAddress}
                  </div>
                  
                  <div className="text-xs text-gray-600 truncate leading-relaxed mb-2">
                    {email.snippet}
                  </div>
                  
                  {email.labelIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {email.labelIds
                        .filter(label => !['INBOX', 'UNREAD'].includes(label))
                        .slice(0, 2)
                        .map(label => (
                          <span
                            key={label}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {getLabelDisplay([label])}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
            {emails.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">
                暂无邮件
              </div>
            )}
          </div>

          {/* 邮件详情 */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {selectedEmail ? (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {getHeaderValue(selectedEmail.payload.headers, 'subject') || '(无主题)'}
                    </h2>
                    {isUnread(selectedEmail.labelIds) && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        未读
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex">
                      <span className="font-medium w-16">发件人:</span>
                      <span className="flex-1">{getHeaderValue(selectedEmail.payload.headers, 'from')}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">收件人:</span>
                      <span className="flex-1">{getHeaderValue(selectedEmail.payload.headers, 'to')}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-16">时间:</span>
                      <span className="flex-1">
                        {selectedEmail.internalDate ? formatDate(selectedEmail.internalDate) : formatDate(selectedEmail.id)}
                      </span>
                    </div>
                    {selectedEmail.labelIds.length > 0 && (
                      <div className="flex">
                        <span className="font-medium w-16">标签:</span>
                        <span className="flex-1">{getLabelDisplay(selectedEmail.labelIds)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                    {getEmailContent(selectedEmail)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-lg font-medium mb-2">请选择一封邮件查看详情</div>
                <div className="text-sm">点击左侧邮件列表中的任意邮件</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 