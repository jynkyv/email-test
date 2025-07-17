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

interface EmailViewerProps {
  onReply?: (emailData: { to: string; subject: string; content: string }) => void;
}

export default function EmailViewer({ onReply }: EmailViewerProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      let url = `/api/email?q=${searchQuery}&maxResults=20`;
      if (selectedLabel) {
        url += `&label=${selectedLabel}`;
      }
      
      const response = await fetch(url);
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

  // 获取可用标签列表
  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/email/labels');
      const data = await response.json();
      
      if (data.success) {
        setAvailableLabels(data.labels || []);
      }
    } catch (error) {
      console.error('获取标签失败:', error);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [searchQuery, selectedLabel]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(parseInt(dateString));
    return date.toLocaleString('zh-CN');
  };

  const getEmailContent = (email: Email) => {
    if (email.payload.body?.data) {
      return decodeEmailContent(email.payload.body.data);
    }
    
    if (email.payload.parts) {
      for (const part of email.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          return decodeEmailContent(part.body.data);
        }
      }
    }
    
    return email.snippet || '无内容';
  };

  const handleReply = (email: Email) => {
    const from = getHeaderValue(email.payload.headers, 'From');
    const subject = getHeaderValue(email.payload.headers, 'Subject');
    const content = getEmailContent(email);
    
    // 提取邮箱地址
    const emailMatch = from.match(/<(.+?)>/) || from.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const emailAddress = emailMatch ? emailMatch[1] || emailMatch[2] : from;
    
    // 构建回复内容
    const replySubject = subject.startsWith('回复:') ? subject : `回复: ${subject}`;
    const replyContent = `\n\n--- 原始邮件 ---\n${content}`;
    
    if (onReply) {
      onReply({
        to: emailAddress,
        subject: replySubject,
        content: replyContent
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">邮件管理</h2>
      
      {/* 搜索和筛选 */}
      <div className="space-y-2 mb-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索邮件..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            刷新
          </button>
        </div>
        
        <div>
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          >
            <option value="">标签筛选: 全部邮件</option>
            {availableLabels.map(label => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 邮件列表和详情区域 */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* 邮件列表 */}
        <div className="w-2/5 flex flex-col">
          <div className="text-sm font-medium text-gray-700 mb-2">邮件列表</div>
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-white">
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无邮件</div>
            ) : (
              <div className="space-y-1 p-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedEmail?.id === email.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {getHeaderValue(email.payload.headers, 'From')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {email.internalDate ? formatDate(email.internalDate) : ''}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-800 mb-1 truncate">
                          {getHeaderValue(email.payload.headers, 'Subject')}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {getHeaderValue(email.payload.headers, 'To')}
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0">
                        已发送
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {email.snippet}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 邮件详情 */}
        <div className="w-3/5 flex flex-col">
          <div className="text-sm font-medium text-gray-700 mb-2">邮件详情</div>
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
            {selectedEmail ? (
              <div className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {getHeaderValue(selectedEmail.payload.headers, 'Subject')}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div><strong>发件人:</strong> {getHeaderValue(selectedEmail.payload.headers, 'From')}</div>
                        <div><strong>收件人:</strong> {getHeaderValue(selectedEmail.payload.headers, 'To')}</div>
                        <div><strong>时间:</strong> {selectedEmail.internalDate ? formatDate(selectedEmail.internalDate) : ''}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReply(selectedEmail)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      回信
                    </button>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {getEmailContent(selectedEmail)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📧</div>
                  <p>选择邮件查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 