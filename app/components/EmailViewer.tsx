'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { 
  Card, 
  List, 
  Avatar, 
  Space, 
  Spin, 
  message,
  Divider,
  Button,
  Tag,
  Modal,
  Form,
  InputNumber,
  Tooltip
} from 'antd';
import { 
  ReloadOutlined, 
  MailOutlined, 
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
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
  const { user } = useAuth();
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [maxResults, setMaxResults] = useState(50); // 默认50
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsForm] = Form.useForm();

  // 获取客户列表
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 获取指定客户的邮件
  const fetchCustomerEmails = async (customerEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/email?q=from:${customerEmail} OR to:${customerEmail}&maxResults=${maxResults}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.messages || []);
      }
    } catch (error) {
      console.error('获取邮件失败:', error);
      message.error(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  // 选择客户
  const handleSelectCustomer = (customer: Customer) => {
    // 如果正在加载，不允许切换客户
    if (loading) {
      return;
    }
    
    setSelectedCustomer(customer);
    setSelectedEmail(null);
    fetchCustomerEmails(customer.email);
  };

  // 保存设置
  const handleSettingsSave = (values: { maxResults: number }) => {
    setMaxResults(values.maxResults);
    setSettingsModalVisible(false);
    message.success(t('settings.settingsSaved'));
    
    // 如果当前有选中的客户，重新获取邮件
    if (selectedCustomer) {
      fetchCustomerEmails(selectedCustomer.email);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('EmailViewer - 用户已加载，开始获取客户列表');
      fetchCustomers();
    }
  }, [user]);

  const getHeaderValue = (headers: Array<{name: string, value: string}>, name: string) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  // 判断邮件是发出的还是收到的
  const isOutgoingEmail = (email: Email, customerEmail: string) => {
    const from = getHeaderValue(email.payload.headers, 'From');
    const to = getHeaderValue(email.payload.headers, 'To');
    
    // 如果发件人包含当前用户的邮箱，则认为是发出的邮件
    const userEmail = user?.email || '';
    return from.toLowerCase().includes(userEmail.toLowerCase()) || 
           !to.toLowerCase().includes(customerEmail.toLowerCase());
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
    
    return email.snippet || t('email.noContent');
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
    const replyContent = `\n\n--- ${t('email.originalEmail')} ---\n${content}`;
    
    if (onReply) {
      onReply({
        to: emailAddress,
        subject: replySubject,
        content: replyContent
      });
    }
  };

  return (
    <Card title={t('navigation.emailManagement')} className="h-full">
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TeamOutlined />
            <span className="font-medium">{t('email.myCustomers')}</span>
          </div>
          <Space>
            <Tooltip title={t('settings.emailSettings')}>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsModalVisible(true)}
                size="small"
              />
            </Tooltip>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCustomers}
              loading={loadingCustomers}
            >
              {t('email.refreshCustomers')}
            </Button>
          </Space>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
        {/* 客户列表 */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b flex-shrink-0">
            <span className="text-sm font-medium">{t('customer.customerList')}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingCustomers ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('customer.noCustomers')}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`cursor-pointer px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                      selectedCustomer && selectedCustomer.id === customer.id 
                        ? 'customer-selected' 
                        : ''
                    } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar icon={<UserOutlined />} size="large" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {customer.company_name}
                          </h4>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            {customer.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('customer.creationTime')}: {new Date(customer.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 邮件列表 */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {selectedCustomer ? t('email.customerEmails', { customerName: selectedCustomer.company_name }) : t('email.emailList')}
              </span>
              {selectedCustomer && (
                <Tag color="blue">
                  {t('settings.maxResults')}: {maxResults}
                </Tag>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!selectedCustomer ? (
              <div className="text-center py-8 text-gray-500">
                {t('email.selectCustomerToViewEmails')}
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-2 text-sm text-gray-500">
                  {t('email.loadingEmails')}
                </div>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('email.noEmailsForCustomer')}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`cursor-pointer px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                      selectedEmail && selectedEmail.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar icon={<MailOutlined />} size="large" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {getHeaderValue(email.payload.headers, 'Subject') || t('email.noSubject')}
                            </h4>
                            {selectedCustomer && (
                              <Tag 
                                color={isOutgoingEmail(email, selectedCustomer.email) ? 'green' : 'blue'}
                              >
                                {isOutgoingEmail(email, selectedCustomer.email) ? t('email.sent') : t('email.received')}
                              </Tag>
                            )}
                          </div>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            {isOutgoingEmail(email, selectedCustomer?.email || '') ? 
                              `${t('email.to')}: ${getHeaderValue(email.payload.headers, 'To')}` :
                              `${t('email.from')}: ${getHeaderValue(email.payload.headers, 'From')}`
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(email.internalDate || '')}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {email.snippet}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 邮件详情弹窗 */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
              <h3 className="text-lg font-medium">{t('email.emailDetails')}</h3>
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => handleReply(selectedEmail)}
              >
                {t('email.reply')}
              </Button>
            </div>
              
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">
                    {getHeaderValue(selectedEmail.payload.headers, 'Subject') || t('email.noSubject')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">{t('email.from')}:</span>
                      <span className="ml-2">{getHeaderValue(selectedEmail.payload.headers, 'From')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('email.to')}:</span>
                      <span className="ml-2">{getHeaderValue(selectedEmail.payload.headers, 'To')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('email.date')}:</span>
                      <span className="ml-2">{formatDate(selectedEmail.internalDate || '')}</span>
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="font-medium mb-2">{t('email.emailContent')}</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {getEmailContent(selectedEmail)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex-shrink-0 text-center">
              <Button onClick={() => setSelectedEmail(null)}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 设置 Modal */}
      <Modal
        title={t('settings.emailSettings')}
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        width={400}
        destroyOnClose
      >
        <Form
          form={settingsForm}
          initialValues={{ maxResults }}
          onFinish={handleSettingsSave}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="maxResults"
            label={t('settings.maxResults')}
            rules={[
              { required: true, message: t('settings.maxResultsRequired') },
              { type: 'number', min: 1, max: 500, message: t('settings.maxResultsRange') }
            ]}
          >
            <InputNumber
              min={1}
              max={500}
              style={{ width: '100%' }}
              addonAfter={t('settings.emails')}
              placeholder={t('settings.maxResultsPlaceholder')}
            />
          </Form.Item>
          
          <div className="text-xs text-gray-500 mb-4">
            {t('settings.maxResultsDescription')}
          </div>
          
          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3">
              <Button onClick={() => setSettingsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('settings.saveSettings')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
} 