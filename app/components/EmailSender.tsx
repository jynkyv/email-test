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
  DatePicker
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  FileTextOutlined,
  TeamOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
  
  // 客户选择相关状态
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // 弹窗内的临时选择状态
  const [tempSelectedCustomers, setTempSelectedCustomers] = useState<Customer[]>([]);
  
  // 时间筛选相关状态
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);

  // 获取客户列表
  const fetchCustomers = async (page = 1, size = 50) => {
    setLoadingCustomers(true);
    try {
      let url = `/api/customers?page=${page}&pageSize=${size}`;
      
      // 添加时间筛选参数
      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }
      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }
      
      console.log('获取客户列表URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setCurrentPage(page);
        setPageSize(size);
        console.log('客户列表获取成功:', { 
          customers: data.customers?.length, 
          total: data.total, 
          page, 
          pageSize: size,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        });
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoadingCustomers(false);
    }
  };

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
    // 将当前选择复制到临时选择状态
    setTempSelectedCustomers([...selectedCustomers]);
    // 重置时间筛选和分页
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    setShowCustomerModal(true);
    // 手动获取数据，因为useEffect可能不会立即触发
    setTimeout(() => {
      fetchCustomers(1, pageSize);
    }, 0);
  };

  // 确认选择客户
  const handleConfirmCustomers = () => {
    // 将临时选择应用到实际选择
    setSelectedCustomers([...tempSelectedCustomers]);
    setShowCustomerModal(false);
    message.success(t('customer.customersSelected', { count: tempSelectedCustomers.length }));
  };

  // 取消选择客户
  const handleCancelCustomers = () => {
    // 取消时清空临时选择，关闭弹窗
    setTempSelectedCustomers([]);
    setShowCustomerModal(false);
  };

  // 模态框关闭时的处理
  const handleModalClose = () => {
    // 确保模态框关闭后清空临时选择
    setTempSelectedCustomers([]);
  };

  // 切换客户选择状态
  const handleCustomerToggle = (customer: Customer, checked: boolean) => {
    if (checked) {
      // 检查是否超过50人的限制
      if (tempSelectedCustomers.length >= 50) {
        message.warning(t('email.maxRecipientsReached', { max: 50 }));
        return;
      }
      setTempSelectedCustomers(prev => [...prev, customer]);
    } else {
      setTempSelectedCustomers(prev => prev.filter(c => c.id !== customer.id));
    }
  };

  // 全选当前页面的客户
  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (checked) {
      // 添加当前页面的所有客户（排除已选择的）
      const currentPageCustomers = customers.filter(
        customer => !tempSelectedCustomers.some(selected => selected.id === customer.id)
      );
      
      // 检查是否超过50人的限制
      const remainingSlots = 50 - tempSelectedCustomers.length;
      if (currentPageCustomers.length > remainingSlots) {
        message.warning(t('email.maxRecipientsReached', { max: 50 }));
        // 只添加能容纳的数量
        const customersToAdd = currentPageCustomers.slice(0, remainingSlots);
        setTempSelectedCustomers(prev => [...prev, ...customersToAdd]);
      } else {
        setTempSelectedCustomers(prev => [...prev, ...currentPageCustomers]);
      }
    } else {
      // 移除当前页面的所有客户
      const currentPageCustomerIds = customers.map(customer => customer.id);
      setTempSelectedCustomers(prev => 
        prev.filter(customer => !currentPageCustomerIds.includes(customer.id))
      );
    }
  };

  // 检查当前页面是否全部选中
  const isCurrentPageAllSelected = () => {
    if (customers.length === 0) return false;
    return customers.every(customer => 
      tempSelectedCustomers.some(selected => selected.id === customer.id)
    );
  };

  // 检查当前页面是否部分选中
  const isCurrentPageIndeterminate = () => {
    const selectedCount = customers.filter(customer => 
      tempSelectedCustomers.some(selected => selected.id === customer.id)
    ).length;
    return selectedCount > 0 && selectedCount < customers.length;
  };

  // 移除单个收件人
  const handleRemoveRecipient = (email: string) => {
    setSelectedCustomers(prev => prev.filter(customer => customer.email !== email));
  };

  // 清空所有收件人
  const handleClearAllRecipients = () => {
    setSelectedCustomers([]);
  };

  // 处理时间筛选变化
  const handleDateRangeChange = (dates: any) => {
    console.log('日期选择变化:', dates);
    if (dates && dates.length === 2) {
      const newStartDate = dates[0].toDate();
      const newEndDate = dates[1].toDate();
      console.log('设置新的日期范围:', { newStartDate, newEndDate });
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else {
      console.log('清空日期范围');
      setStartDate(null);
      setEndDate(null);
    }
    // 重置到第一页
    setCurrentPage(1);
  };

  // 监听时间筛选变化，重新获取数据
  useEffect(() => {
    if (showCustomerModal) {
      console.log('时间筛选变化，重新获取数据:', { startDate, endDate });
      fetchCustomers(1, pageSize);
    }
  }, [startDate, endDate, showCustomerModal]);

  // 清空时间筛选
  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const handleSubmit = async (values: {
    to: string;
    subject: string;
    content: string;
  }) => {
    if (!values.subject.trim() || !values.content.trim()) {
      message.error(t('email.subjectRequired') + ' 和 ' + t('email.contentRequired'));
      return;
    }

    // 检查是否选择了客户
    if (!selectedCustomers.length) {
      message.error(t('email.recipientsRequired'));
      return;
    }

    setIsSending(true);

    // 使用选中的客户邮箱
    const recipients = selectedCustomers.map(customer => customer.email);

    if (recipients.length === 0) {
      message.error(t('email.noRecipients'));
      setIsSending(false);
      return;
    }

      try {
      // 提交审核申请
      const response = await fetch('/api/email-approvals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.id}`,
          },
          body: JSON.stringify({
            subject: values.subject,
          content: values.content,
          recipients: recipients
          }),
        });

        const result = await response.json();
        
        if (result.success) {
        message.success(t('email.approvalSubmitted'));
    // 清空表单
    form.resetFields();
    setSelectedCustomers([]);
    // 通知父组件发送完成
    onSendComplete?.();
      } else {
        message.error(result.error || t('email.approvalSubmitFailed'));
      }
    } catch (error) {
      console.error('提交审核申请失败:', error);
      message.error(t('email.approvalSubmitFailed'));
    } finally {
      setIsSending(false);
    }
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
                    {t('customer.customersSelected', { count: selectedCustomers.length })} / 50
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
            rules={[{ required: true, message: t('email.contentRequired') }]}
            className="flex-1"
          >
            <TextArea
              rows={12}
              placeholder={t('email.contentPlaceholder')}
              showCount
              maxLength={5000}
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
            {isSending ? t('email.submitting') : t('email.submitForApproval')}
          </Button>
        </Form.Item>
      </Form>

      {/* 客户选择模态框 */}
      <Modal
        title={t('customer.selectCustomer')}
        open={showCustomerModal}
        onOk={handleConfirmCustomers}
        onCancel={handleCancelCustomers}
        width={600}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{
          disabled: tempSelectedCustomers.length === 0
        }}
        afterClose={handleModalClose}
        maskClosable={false}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {t('customer.customersSelected', { count: tempSelectedCustomers.length })}
            {tempSelectedCustomers.length >= 50 && (
              <span className="text-orange-600 ml-2">
                ({t('email.maxRecipientsLimit', { max: 50 })})
              </span>
            )}
          </div>
          
          {/* 限制提示 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>{t('email.recipientsLimitNotice', { max: 50 })}</strong>
            </div>
          </div>
          
          {/* 时间筛选 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">{t('customer.filterByCreationTime')}</span>
              {(startDate || endDate) && (
                <Button 
                  size="small" 
                  type="text" 
                  onClick={handleClearDateFilter}
                >
                  {t('common.clearFilter')}
                </Button>
              )}
            </div>
            <RangePicker
              className="w-full"
              placeholder={[t('customer.startDate'), t('customer.endDate')]}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
            />
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
            <div className="border rounded-lg">
              {/* 全选当前页面 */}
              <div className="px-6 py-3 border-b bg-gray-50">
                <Checkbox
                  checked={isCurrentPageAllSelected()}
                  indeterminate={isCurrentPageIndeterminate()}
                  onChange={(e) => handleSelectAllCurrentPage(e.target.checked)}
                >
                  <span className="text-sm font-medium">
                    {t('customer.selectAllCurrentPage')}
                  </span>
                </Checkbox>
              </div>
              
              {/* 客户列表 */}
              <div className="max-h-96 overflow-y-auto">
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
                              checked={tempSelectedCustomers.some(c => c.id === customer.id)}
                              onChange={(e) => handleCustomerToggle(customer, e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 分页 */}
              <div className="px-6 py-3 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t('common.totalRecords', { total })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      disabled={currentPage === 1}
                      onClick={() => fetchCustomers(currentPage - 1, pageSize)}
                    >
                      {t('common.previous')}
                    </Button>
                    <span className="text-sm text-gray-600">
                      {t('common.pageInfo', { current: currentPage, total: Math.ceil(total / pageSize) })}
                    </span>
                    <Button
                      size="small"
                      disabled={currentPage >= Math.ceil(total / pageSize)}
                      onClick={() => fetchCustomers(currentPage + 1, pageSize)}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
} 