'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  List, 
  Avatar, 
  Space, 
  Tag, 
  Spin, 
  message,
  Divider 
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  MailOutlined, 
  UserOutlined,
  MessageOutlined 
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

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
      message.error('获取邮件失败');
    } finally {
      setLoading(false);
    }
  };

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
    <Card title="邮件管理" className="h-full">
      <div className="space-y-4 mb-4">
        <Space.Compact className="w-full">
          <Search
            placeholder="搜索邮件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={fetchEmails}
            enterButton
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchEmails}
            loading={loading}
          >
            刷新
          </Button>
        </Space.Compact>
        
        <Select
          placeholder="标签筛选: 全部邮件"
          value={selectedLabel}
          onChange={setSelectedLabel}
          allowClear
          className="w-full"
        >
          {availableLabels.map(label => (
            <Option key={label} value={label}>
              {label}
            </Option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* 邮件列表 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium">邮件列表</span>
          </div>
          <div className="h-full overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无邮件</div>
            ) : (
              <List
                dataSource={emails}
                renderItem={(email) => (
                  <List.Item
                    className={`cursor-pointer hover:bg-gray-50 px-4 py-3 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<MailOutlined />} />}
                      title={
                        <div className="flex justify-between items-start">
                          <span className="font-medium truncate">
                            {getHeaderValue(email.payload.headers, 'Subject') || '无主题'}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            icon={<MessageOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReply(email);
                            }}
                          />
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {getHeaderValue(email.payload.headers, 'From')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(email.internalDate || '')}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {email.snippet}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>

        {/* 邮件详情 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium">邮件详情</span>
          </div>
          <div className="h-full overflow-y-auto p-4">
            {selectedEmail ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    {getHeaderValue(selectedEmail.payload.headers, 'Subject') || '无主题'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">发件人:</span>
                      <span className="ml-2">{getHeaderValue(selectedEmail.payload.headers, 'From')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">收件人:</span>
                      <span className="ml-2">{getHeaderValue(selectedEmail.payload.headers, 'To')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">时间:</span>
                      <span className="ml-2">{formatDate(selectedEmail.internalDate || '')}</span>
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-medium mb-2">邮件内容</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {getEmailContent(selectedEmail)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                请选择一封邮件查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 