'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Space, 
  Spin, 
  message,
  Divider,
  Button,
  Tag
} from 'antd';
import { 
  ReloadOutlined, 
  MailOutlined,
  MessageOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

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

interface Customer {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
}

interface EmailViewerProps {
  onReply?: (emailData: { to: string; subject: string; content: string }) => void;
}

export default function EmailViewer({ onReply }: EmailViewerProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // 获取客户列表
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error('获取客户列表失败');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 获取指定客户的邮件
  const fetchCustomerEmails = async (customerEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email?q=from:${customerEmail} OR to:${customerEmail}&maxResults=50`);
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.messages || []);
      }
    } catch (error) {
      console.error('获取邮件失败:', error);
      message.error('获取邮件失败');
    } finally {
      setLoading(false);
    }
  };

  // 选择客户
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedEmail(null);
    fetchCustomerEmails(customer.email);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TeamOutlined />
            <span className="font-medium">我的客户</span>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCustomers}
            loading={loadingCustomers}
          >
            刷新客户
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* 客户列表 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium">客户列表</span>
          </div>
          <div className="h-full overflow-y-auto">
            {loadingCustomers ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无客户</div>
            ) : (
              <List
                dataSource={customers}
                renderItem={(customer) => (
                  <List.Item
                    className={`cursor-pointer hover:bg-gray-50 px-4 py-3 ${
                      selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div className="flex justify-between items-start">
                          <span className="font-medium truncate">
                            {customer.company_name}
                          </span>
                          <Tag color="blue">
                            {emails.length} 封邮件
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {customer.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            创建时间: {new Date(customer.created_at).toLocaleDateString()}
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

        {/* 邮件列表 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium">
              {selectedCustomer ? `${selectedCustomer.company_name} 的邮件` : '邮件列表'}
            </span>
          </div>
          <div className="h-full overflow-y-auto">
            {!selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">
                请选择一个客户查看邮件
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                该客户暂无邮件记录
              </div>
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
      </div>

      {/* 邮件详情弹窗 */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">邮件详情</h3>
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => handleReply(selectedEmail)}
              >
                回复
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg mb-2">
                  {getHeaderValue(selectedEmail.payload.headers, 'Subject') || '无主题'}
                </h4>
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
            
            <div className="mt-6 text-center">
              <Button onClick={() => setSelectedEmail(null)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 