'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Progress, 
  message, 
  Space,
  Divider,
  Modal,
  List,
  Checkbox,
  Avatar,
  Spin,
  Tabs
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  FileTextOutlined,
  TeamOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

interface ReplyData {
  to: string;
  subject: string;
  content: string;
}

interface Customer {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
}

interface EmailSenderProps {
  replyData?: ReplyData | null;
  onSendComplete?: () => void;
}

export default function EmailSender({ replyData, onSendComplete }: EmailSenderProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [form] = Form.useForm();
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);
  const [sentEmails, setSentEmails] = useState(0);
  
  // 邮件内容模式
  const [contentMode, setContentMode] = useState<'text' | 'template'>('template');
  
  // 模板预览相关状态
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  
  // 模板选择状态
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('default');
  
  // 客户选择相关状态
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

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

  // 组件初始化时获取客户数据
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 当收到回信数据时，重置选择并设置回信人
  useEffect(() => {
    if (replyData) {
      // 重置表单和选择
      form.resetFields();
      setSelectedCustomers([]);
      
      // 设置回信内容
      form.setFieldsValue({
        to: replyData.to,
        subject: replyData.subject,
        content: replyData.content,
      });

      // 检查回信人是否在客户列表中
      const existingCustomer = customers.find(customer => customer.email === replyData.to);
      
      if (existingCustomer) {
        // 如果回信人已存在，添加到选择列表
        setSelectedCustomers([existingCustomer]);
        message.success(`${t('email.replyTo')}: ${existingCustomer.company_name} (${replyData.to})`);
      } else {
        // 如果回信人不在客户列表中，创建临时客户对象
        const tempCustomer: Customer = {
          id: `temp_${Date.now()}`,
          company_name: replyData.to.split('@')[0], // 使用邮箱前缀作为公司名
          email: replyData.to,
          created_at: new Date().toISOString()
        };
        
        setSelectedCustomers([tempCustomer]);
        message.success(`${t('email.replyTo')}: ${replyData.to} ${t('email.addedToRecipients')}`);
      }
    }
  }, [replyData, form, customers]);

  // 打开客户选择弹窗
  const handleOpenCustomerModal = () => {
    setShowCustomerModal(true);
  };

  // 确认选择客户
  const handleConfirmCustomers = () => {
    setShowCustomerModal(false);
    message.success(t('customer.customersSelected', { count: selectedCustomers.length }));
  };

  // 取消选择客户
  const handleCancelCustomers = () => {
    setSelectedCustomers([]);
    setShowCustomerModal(false);
  };

  // 切换客户选择状态
  const handleCustomerToggle = (customer: Customer, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customer]);
    } else {
      setSelectedCustomers(prev => prev.filter(c => c.id !== customer.id));
    }
  };

  // 移除单个收件人
  const handleRemoveRecipient = (email: string) => {
    setSelectedCustomers(prev => prev.filter(customer => customer.email !== email));
  };

  // 清空所有收件人
  const handleClearAllRecipients = () => {
    setSelectedCustomers([]);
  };

  const handleSubmit = async (values: {
    to: string;
    subject: string;
    content: string;
  }) => {
    if (!values.subject.trim()) {
      message.error(t('email.subjectRequired'));
      return;
    }

    // 检查是否选择了客户
    if (!selectedCustomers.length) {
      message.error(t('email.recipientsRequired'));
      return;
    }

    setIsSending(true);
    setProgress(0);
    setSentEmails(0);

    // 使用选中的客户邮箱
    const recipients = selectedCustomers.map(customer => customer.email);
    setTotalEmails(recipients.length);

    if (recipients.length === 0) {
      message.error(t('email.noRecipients'));
      setIsSending(false);
      return;
    }

    // 根据模式准备邮件内容
    let emailContent = '';
    if (contentMode === 'text') {
      emailContent = values.content;
    } else {
      // 模板模式使用选中的模板或默认模板
      if (selectedTemplate === 'default') {
        // 默认HTML模板
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        emailContent = `
          <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t('email.templatePreview')}</title>
              </head>
              <body style="margin: 0; padding: 0;">
                <div style="max-width: 750px; margin: 0 auto;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/header.png" alt="Header" style="width: 100%; display: block;">
                  </a>
                  <img src="${baseUrl}/hero.png" alt="Hero" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/web-button.png" alt="Web Button" style="width: 100%; display: block;">
                  </a>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0 20px 0;">
                    <img src="${baseUrl}/flag.png" alt="Flag" style="width:60%; height: auto;">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${baseUrl}/qrcode-1.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${baseUrl}/app-store.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${baseUrl}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${baseUrl}/google-play.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                  </div>
                  <img src="${baseUrl}/detail.png" alt="Detail" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/telephone.png" alt="Telephone" style="width: 100%; display: block;">
                  </a>
                </div>
              </body>
              </html>
        `;
      } else if (selectedTemplate) {
        emailContent = selectedTemplate;
      } else {
        // 如果没有选择模板，使用默认模板
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        emailContent = `
          <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t('email.templatePreview')}</title>
              </head>
              <body style="margin: 0; padding: 0;">
                <div style="max-width: 750px; margin: 0 auto;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/header.png" alt="Header" style="width: 100%; display: block;">
                  </a>
                  <img src="${baseUrl}/hero.png" alt="Hero" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/web-button.png" alt="Web Button" style="width: 100%; display: block;">
                  </a>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0 20px 0;">
                    <img src="${baseUrl}/flag.png" alt="Flag" style="width:60%; height: auto;">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${baseUrl}/qrcode-1.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${baseUrl}/app-store.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${baseUrl}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${baseUrl}/google-play.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                  </div>
                  <img src="${baseUrl}/detail.png" alt="Detail" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${baseUrl}/telephone.png" alt="Telephone" style="width: 100%; display: block;">
                  </a>
                </div>
              </body>
              </html>
        `;
      }
    }

    // 逐个发送邮件
    for (let i = 0; i < recipients.length; i++) {
      try {
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            to: recipients[i],
            subject: values.subject,
            html: emailContent,
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
    form.resetFields();
    setSelectedCustomers([]);
    
    // 通知父组件发送完成
    onSendComplete?.();
    message.success(t('email.sendComplete'));
  };

  // 渲染收件人标签
  const renderRecipientTags = () => {
    if (selectedCustomers.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{t('email.selectedCustomers')}:</span>
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined />}
            onClick={handleClearAllRecipients}
          >
            {t('common.clearAll')}
          </Button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
          <div className="flex flex-wrap gap-2">
            {selectedCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm flex-shrink-0"
              >
                <span>{customer.company_name} ({customer.email})</span>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleRemoveRecipient(customer.email)}
                  className="text-blue-700 hover:text-blue-900"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card title={t('email.bulkEmail')} className="h-full">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        className="h-full flex flex-col"
      >
        <div className="flex-1 space-y-4">
          <Form.Item
            name="to"
            label={t('email.recipientList')}
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={handleOpenCustomerModal}
                  className="flex-shrink-0"
                >
                  {t('email.selectCustomers')}
                </Button>
                {selectedCustomers.length > 0 && (
                  <span className="text-sm text-gray-600 self-center">
                    {t('customer.customersSelected', { count: selectedCustomers.length })}
                  </span>
                )}
              </div>
              {renderRecipientTags()}
            </div>
          </Form.Item>

          <Form.Item
            name="subject"
            label={t('email.emailSubject')}
            rules={[{ required: true, message: t('email.subjectRequired') }]}
          >
            <Input placeholder={t('email.subjectPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="content"
            label={t('email.emailContent')}
            rules={contentMode === 'text' ? [{ required: true, message: t('email.contentRequired') }] : []}
            className="flex-1"
          >
            <Tabs
              activeKey={contentMode}
              onChange={(key) => setContentMode(key as 'text' | 'template')}
              items={[
                {
                  key: 'text',
                  label: t('email.textMode'),
                  children: (
                    <TextArea
                      rows={12}
                      placeholder={t('email.contentPlaceholder')}
                      showCount
                      maxLength={5000}
                    />
                  ),
                },
                {
                  key: 'template',
                  label: t('email.templateMode'),
                  children: (
                    <div className="space-y-4 min-h-[272px]">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all w-64 h-32 flex flex-col ${
                          selectedTemplate 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(selectedTemplate ? null : 'default')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">{t('email.emailTemplate')}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex-1">{t('email.templateDescription')}</p>
                        <div className="mt-auto">
                          <Button
                            type="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTemplatePreview(true);
                            }}
                          >
                            {t('email.previewTemplate')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Form.Item>
        </div>

        <Divider />

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSending}
            icon={<SendOutlined />}
            size="large"
            block
          >
            {isSending ? t('email.sending') : t('email.sendEmail')}
          </Button>
        </Form.Item>
      </Form>

      {/* 发送进度通知 */}
      {isSending && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border border-gray-200 rounded-full shadow-lg px-6 py-3 flex items-center space-x-3 min-w-80">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">{t('email.sendInProgress')}</span>
                <span className="text-xs text-gray-500">{sentEmails}/{totalEmails}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模板预览模态框 */}
      <Modal
        title={t('email.templatePreview')}
        open={showTemplatePreview}
        onCancel={() => setShowTemplatePreview(false)}
        footer={[
          <Button key="close" onClick={() => setShowTemplatePreview(false)}>
            {t('common.close')}
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <div className="bg-white border rounded-lg overflow-hidden">
          <iframe
            srcDoc={`
               <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t('email.templatePreview')}</title>
              </head>
              <body style="margin: 0; padding: 0;">
                <div style="max-width: 750px; margin: 0 auto;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/header.png" alt="Header" style="width: 100%; display: block;">
                  </a>
                  <img src="${process.env.NEXT_PUBLIC_BASE_URL}/hero.png" alt="Hero" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/web-button.png" alt="Web Button" style="width: 100%; display: block;">
                  </a>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0 20px 0;">
                    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/flag.png" alt="Flag" style="width:60%; height: auto;">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/qrcode-1.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/app-store.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; width: 10%; margin-right: 5%">
                    <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/qrcode-2.png" alt="QR Code" style="width: 100%; height: auto; margin-bottom: 10px;">
                      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/google-play.svg" alt="Web Button" style="width: 100%; height: auto;">
                      </a>
                    </div>
                  </div>
                  <img src="${process.env.NEXT_PUBLIC_BASE_URL}/detail.png" alt="Detail" style="width: 100%; display: block;">
                  <a href="https://www.familyorjp.com/" target="_blank" style="display: block;">
                    <img src="${process.env.NEXT_PUBLIC_BASE_URL}/telephone.png" alt="Telephone" style="width: 100%; display: block;">
                  </a>
                </div>
              </body>
              </html>
            `}
            style={{ width: '100%', height: '600px', border: 'none' }}
            title="邮件模板预览"
          />
        </div>
      </Modal>

      {/* 客户选择模态框 */}
      <Modal
        title={t('customer.selectCustomer')}
        open={showCustomerModal}
        onOk={handleConfirmCustomers}
        onCancel={handleCancelCustomers}
        width={600}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        destroyOnClose={false}
        okButtonProps={{
          disabled: selectedCustomers.length === 0
        }}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {t('customer.customersSelected', { count: selectedCustomers.length })}
          </div>
          
          {loadingCustomers ? (
            <div className="text-center py-8">
              <Spin />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('customer.noCustomerData')}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {loadingCustomers ? (
                <div className="text-center py-8">
                  <Spin />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('customer.noCustomerData')}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar icon={<UserOutlined />} size="large" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {customer.company_name}
                              </h4>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  {customer.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {t('customer.creationTime')}: {new Date(customer.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Checkbox
                              checked={selectedCustomers.some(c => c.id === customer.id)}
                              onChange={(e) => handleCustomerToggle(customer, e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
} 