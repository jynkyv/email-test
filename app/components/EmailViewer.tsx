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
  Input,
  InputNumber,
  Tooltip,
  Badge
} from 'antd';
import { 
  ReloadOutlined, 
  MailOutlined, 
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  DeleteOutlined
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
  has_unread_emails?: boolean; // 添加未读邮件标记
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
  const [viewMode, setViewMode] = useState<'text' | 'html'>('text');
  
  // 客户列表分页相关状态
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(50);
  const [customerTotal, setCustomerTotal] = useState(0);

  // 获取客户列表
  const fetchCustomers = async (page = 1, size = 50) => {
    setLoadingCustomers(true);
    try {
      const response = await fetch(`/api/customers?page=${page}&pageSize=${size}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setCustomerTotal(data.total || 0);
        setCustomerCurrentPage(page);
        setCustomerPageSize(size);
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 获取指定客户的邮件
  const fetchCustomerEmails = async (customer: Customer) => {
    setLoading(true);
    try {
      // 使用客户ID查询邮件
      const response = await fetch(`/api/customers/${customer.id}/emails?maxResults=${maxResults}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      
      if (data.messages) {
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
    fetchCustomerEmails(customer); // 传递整个客户对象
  };

  // 更新邮件已读/未读状态
  const updateEmailStatus = async (emailId: string, action: 'read' | 'unread', showMessage = true) => {
    try {
      const response = await fetch(`/api/email/${emailId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 更新本地邮件状态
        setEmails(prevEmails => 
          prevEmails.map(email => 
            email.id === emailId 
              ? {
                  ...email,
                  labelIds: action === 'read' 
                    ? email.labelIds.filter(id => id !== 'UNREAD')
                    : [...email.labelIds.filter(id => id !== 'READ'), 'UNREAD']
                }
              : email
          )
        );

        // 如果标记为已读，更新客户列表中的未读状态
        if (action === 'read' && selectedCustomer) {
          // 检查是否还有其他未读邮件
          const updatedEmails = emails.map(email => 
            email.id === emailId 
              ? { ...email, labelIds: email.labelIds.filter(id => id !== 'UNREAD') }
              : email
          );
          
          const hasUnreadEmails = updatedEmails.some(email => email.labelIds.includes('UNREAD'));
          
          // 更新客户列表
          setCustomers(prevCustomers => 
            prevCustomers.map(customer => 
              customer.id === selectedCustomer.id 
                ? { ...customer, has_unread_emails: hasUnreadEmails }
                : customer
            )
          );
        }

        if (showMessage) {
          message.success(data.message);
        }
      } else {
        message.error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('更新邮件状态失败:', error);
      message.error(t('common.networkError'));
    }
  };

  // 保存设置
  const handleSettingsSave = (values: { maxResults: number }) => {
    setMaxResults(values.maxResults);
    setSettingsModalVisible(false);
    message.success(t('settings.settingsSaved'));
    
    // 如果当前有选中的客户，重新获取邮件
    if (selectedCustomer) {
      fetchCustomerEmails(selectedCustomer); // 传递整个客户对象
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
    const direction = getHeaderValue(email.payload.headers, 'Direction');
    
    // 如果有direction标记，直接使用
    if (direction === 'outbound') {
      return true;
    }
    
    // 提取邮箱地址的函数
    const extractEmail = (emailString: string) => {
      const emailMatch = emailString.match(/<(.+?)>/) || emailString.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return emailMatch ? emailMatch[1] || emailMatch[2] : emailString.toLowerCase();
    };
    
    const fromEmail = extractEmail(from);
    const toEmails = to.split(',').map(email => extractEmail(email.trim()));
    
    // 如果发件人等于当前选择的客户邮箱，则认为是收到的邮件（已接收）
    // 如果收件人包含当前选择的客户邮箱，则认为是发出的邮件（已发送）
    const isFromCustomer = fromEmail.includes(customerEmail.toLowerCase());
    const isToCustomer = toEmails.some(email => email.includes(customerEmail.toLowerCase()));
    
    return !isFromCustomer && isToCustomer;
  };

  // 判断邮件是否已读
  const isEmailRead = (email: Email) => {
    return !email.labelIds.includes('UNREAD');
  };

  // 处理邮件点击
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    
    // 如果邮件未读，立即标记为已读
    if (!isEmailRead(email)) {
      updateEmailStatus(email.id, 'read', false);
    }
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

  // 获取邮件的HTML内容
  const getEmailHtmlContent = (email: Email) => {
    if (email.payload.parts) {
      for (const part of email.payload.parts) {
        if (part.mimeType === 'text/html' && part.body.data) {
          return decodeEmailContent(part.body.data);
        }
      }
    }
    
    // 如果没有HTML部分，检查body是否包含HTML
    if (email.payload.body?.data) {
      const content = decodeEmailContent(email.payload.body.data);
      // 简单检查是否包含HTML标签
      if (content.includes('<') && content.includes('>')) {
        return content;
      }
    }
    
    return null;
  };

  // 清理HTML内容，防止XSS攻击
  const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    
    // 创建一个临时的DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 移除所有script标签
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // 移除所有style标签
    const styles = tempDiv.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    // 移除所有iframe标签
    const iframes = tempDiv.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.remove());
    
    // 移除所有object标签
    const objects = tempDiv.querySelectorAll('object');
    objects.forEach(obj => obj.remove());
    
    // 移除所有embed标签
    const embeds = tempDiv.querySelectorAll('embed');
    embeds.forEach(embed => embed.remove());
    
    // 移除所有on*事件属性
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      const attrs = element.getAttributeNames();
      attrs.forEach(attr => {
        if (attr.startsWith('on')) {
          element.removeAttribute(attr);
        }
      });
    });
    
    return tempDiv.innerHTML;
  };

  // 将HTML转换为纯文本
  const htmlToText = (html: string): string => {
    if (!html) return '';
    
    // 创建一个临时的DOM元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 获取纯文本内容
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // 清理多余的空白字符
    text = text.replace(/\s+/g, ' ').trim();
    
    // 处理常见的HTML实体
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    return text;
  };

  const handleReply = (email: Email) => {
    const from = getHeaderValue(email.payload.headers, 'From');
    const subject = getHeaderValue(email.payload.headers, 'Subject');
    
    // 优先使用HTML内容，如果没有则使用纯文本
    const htmlContent = getEmailHtmlContent(email);
    const textContent = getEmailContent(email);
    const originalContent = htmlContent || textContent;
    
    // 提取邮箱地址
    const emailMatch = from.match(/<(.+?)>/) || from.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const emailAddress = emailMatch ? emailMatch[1] || emailMatch[2] : from;
    
    // 构建回复内容
    const replySubject = subject.startsWith('回复:') ? subject : `回复: ${subject}`;
    
    // 如果原始内容是HTML，转换为纯文本用于回复
    const replyContent = htmlContent 
      ? `\n\n--- ${t('email.originalEmail')} ---\n${htmlToText(htmlContent)}`
      : `\n\n--- ${t('email.originalEmail')} ---\n${textContent}`;
    
    if (onReply) {
      onReply({
        to: emailAddress,
        subject: replySubject,
        content: replyContent
      });
    }
  };

  // 渲染邮件列表项
  const renderEmailItem = (email: Email, index: number) => {
    const from = getHeaderValue(email.payload.headers, 'From');
    const to = getHeaderValue(email.payload.headers, 'To');
    const subject = getHeaderValue(email.payload.headers, 'Subject');
    const date = getHeaderValue(email.payload.headers, 'Date');
    const direction = getHeaderValue(email.payload.headers, 'Direction');
    
    const isOutgoing = direction === 'outbound' || isOutgoingEmail(email, selectedCustomer?.email || '');
    const isRead = isEmailRead(email);
    
    return (
      <div
        key={email.id}
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
          selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
        } ${!isRead ? 'bg-yellow-50' : ''}`}
        onClick={() => handleEmailClick(email)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${
                isOutgoing 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isOutgoing ? t('email.sent') : t('email.received')}
              </span>
              {!isRead && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  {t('email.unread')}
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {isOutgoing ? t('email.to') : t('email.from')}:
                </span>
                <span className="text-sm text-gray-600">
                  {isOutgoing ? to : from}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-900">
                  {t('email.emailSubject')}:
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  {subject || t('email.noSubject')}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-sm text-gray-500">
                  {new Date(date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
              onClick={() => fetchCustomers(customerCurrentPage, customerPageSize)}
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
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('customer.customerList')}</span>
              <span className="text-xs text-gray-500">
                {t('common.totalRecords', { total: customerTotal })}
              </span>
            </div>
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
                {customers.map((customer) => {
                  const isSelected = selectedCustomer && selectedCustomer.id === customer.id;
                  
                  return (
                    <div
                      key={customer.id}
                      className={`cursor-pointer px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar icon={<UserOutlined />} size="large" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {customer.company_name}
                            </h4>
                            {customer.has_unread_emails && (
                              <div 
                                style={{ 
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#52c41a',
                                  flexShrink: 0
                                }} 
                              />
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            <p className={`text-sm ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                              {customer.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t('customer.creationTime')}: {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* 客户列表分页 */}
          {!loadingCustomers && customerTotal > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t('common.totalRecords', { total: customerTotal })}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    disabled={customerCurrentPage === 1}
                    onClick={() => fetchCustomers(customerCurrentPage - 1, customerPageSize)}
                  >
                    {t('common.previous')}
                  </Button>
                  
                  {/* 页码输入 */}
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">{t('common.page')}:</span>
                    <Input
                      size="small"
                      style={{ width: 60 }}
                      value={customerCurrentPage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const page = parseInt(e.target.value);
                        if (page && page > 0 && page <= Math.ceil(customerTotal / customerPageSize)) {
                          fetchCustomers(page, customerPageSize);
                        }
                      }}
                      onPressEnter={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        const page = parseInt((e.target as HTMLInputElement).value);
                        if (page && page > 0 && page <= Math.ceil(customerTotal / customerPageSize)) {
                          fetchCustomers(page, customerPageSize);
                        }
                      }}
                    />
                    <span className="text-sm text-gray-600">/ {Math.ceil(customerTotal / customerPageSize)}</span>
                  </div>
                  
                  <Button
                    size="small"
                    disabled={customerCurrentPage >= Math.ceil(customerTotal / customerPageSize)}
                    onClick={() => fetchCustomers(customerCurrentPage + 1, customerPageSize)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 邮件列表 */}
        <div className="border rounded-lg overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b flex-shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {selectedCustomer ? t('email.customerEmails', { customerName: selectedCustomer.company_name }) : t('email.emailList')}
              </span>
              <div className="flex items-center gap-2">
                {selectedCustomer && (
                  <Tag color="blue">
                    {t('settings.maxResults')}: {maxResults}
                  </Tag>
                )}
              </div>
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
                {emails.map((email) => renderEmailItem(email, emails.indexOf(email)))}
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
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{t('email.emailContent')}</h4>
                    {getEmailHtmlContent(selectedEmail) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {t('email.htmlContentDetected')}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="small"
                            type={viewMode === 'text' ? 'primary' : 'default'}
                            onClick={() => setViewMode('text')}
                            title={t('email.switchToTextView')}
                          >
                            {t('email.textView')}
                          </Button>
                          <Button
                            size="small"
                            type={viewMode === 'html' ? 'primary' : 'default'}
                            onClick={() => setViewMode('html')}
                            title={t('email.switchToHtmlView')}
                          >
                            {t('email.htmlView')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-96 overflow-y-auto">
                    {viewMode === 'html' && getEmailHtmlContent(selectedEmail) ? (
                      <div 
                        className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-gray-800"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(getEmailHtmlContent(selectedEmail) || '') 
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {getEmailContent(selectedEmail)}
                      </div>
                    )}
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
          onFinish={handleSettingsSave}
          layout="vertical"
          initialValues={{ maxResults }}
        >
          <Form.Item
            name="maxResults"
            label={t('settings.maxResults')}
            rules={[
              { required: true, message: t('settings.maxResultsRequired') },
              { type: 'number', min: 10, max: 100, message: t('settings.maxResultsRange') }
            ]}
          >
            <InputNumber 
              min={10} 
              max={100} 
              style={{ width: '100%' }}
              placeholder={t('settings.maxResultsPlaceholder')}
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3">
              <Button onClick={() => setSettingsModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit">
                {t('settings.save')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
} 