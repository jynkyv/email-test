'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { textToHtml, debounce } from '@/lib/utils';
import { EMAIL_TEMPLATES, EmailTemplate } from '@/lib/emailTemplates';
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
  DatePicker,
  Select,
  Tooltip,
  Tabs
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  FileTextOutlined,
  TeamOutlined,
  CloseOutlined,
  CodeOutlined,
  EditOutlined,
  FileTextOutlined as TemplateOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ReplyData {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean; // 标识内容是否为HTML格式
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
  
  // HTML内容相关状态
  const [isHtmlContent, setIsHtmlContent] = useState(false);
  
  // 模板相关状态
  
  // 模板预览相关状态
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [total, setTotal] = useState(0);
  const [tempPageInput, setTempPageInput] = useState('1'); // 临时页码输入状态
  
  // 搜索相关状态
  const [searchField, setSearchField] = useState('company_name');
  const [searchValue, setSearchValue] = useState('');
  const [searchForm] = Form.useForm();
  
  // 移除防抖搜索函数，改为手动搜索
  
  // 创建防抖的页码跳转函数
  const debouncedPageChange = debounce((page: number) => {
    if (page && page > 0 && page <= Math.ceil(total / 100)) {
      setCurrentPage(page);
      fetchCustomers(page, 100);
    }
  }, 1000);

  // 获取客户列表
  const fetchCustomers = async (page = 1, size = 100, searchFieldParam?: string, searchValueParam?: string) => {
    setLoadingCustomers(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        hasEmailOnly: 'true', // 只获取有邮箱的客户
        subscriptionStatus: 'subscribed', // 只获取未退订的客户
        searchField: searchFieldParam !== undefined ? searchFieldParam : searchField,
        searchValue: searchValueParam !== undefined ? searchValueParam : searchValue
      });
      
      // 添加时间筛选参数
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      console.log('Fetch customers URL:', `/api/customers?${params}`);
      
      const response = await fetch(`/api/customers?${params}`, {
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
        setTempPageInput(page.toString());
        console.log('Customers fetched successfully:', { 
          customers: data.customers?.length, 
          total: data.total, 
          page, 
          pageSize: size,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 当收到回信数据时，重置选择并设置回信人
  // 当replyData为null时，清空表单和选择
  useEffect(() => {
    if (replyData) {
      console.log('收到回复数据:', replyData);
      
      // 重置表单和选择
      form.resetFields();
      setSelectedCustomers([]);
      
      // 设置回信内容 - 使用setTimeout确保表单字段已初始化
      setTimeout(() => {
        form.setFieldsValue({
          to: replyData.to,
          subject: replyData.subject,
          content: replyData.content,
        });
        console.log('表单字段已设置:', {
          to: replyData.to,
          subject: replyData.subject,
          content: replyData.content,
        });
      }, 0);

      // 设置HTML内容标识
      setIsHtmlContent(replyData.isHtml || false);

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
    } else if (replyData === null) {
      // 只有当replyData明确为null时，才清空表单和选择
      form.resetFields();
      setSelectedCustomers([]);
      setIsHtmlContent(false);

    }
    // 当replyData为undefined时，不执行任何操作，保持当前状态
  }, [replyData, form]); // 移除customers依赖，避免客户列表更新时重置表单

  // 当客户列表更新时，检查是否需要更新回信人的客户信息
  useEffect(() => {
    if (replyData && customers.length > 0 && selectedCustomers.length === 1) {
      const currentSelected = selectedCustomers[0];
      // 检查当前选择的客户是否是临时客户（用于回信）
      if (currentSelected.id.startsWith('temp_') && currentSelected.email === replyData.to) {
        // 查找真实的客户信息
        const existingCustomer = customers.find(customer => customer.email === replyData.to);
        if (existingCustomer) {
          // 用真实客户信息替换临时客户信息
          setSelectedCustomers([existingCustomer]);
        }
      }
    }
  }, [customers, replyData, selectedCustomers]);

  // 打开客户选择弹窗
  const handleOpenCustomerModal = () => {
    // 将当前选择复制到临时选择状态
    setTempSelectedCustomers([...selectedCustomers]);
    setShowCustomerModal(true);
    // 只有在没有数据时才获取数据，保留用户的分页状态
    if (customers.length === 0) {
      fetchCustomers(1, 100);
    }
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
    // 取消时恢复原始选择，关闭弹窗
    setTempSelectedCustomers([...selectedCustomers]);
    setShowCustomerModal(false);
  };

  // 模态框关闭时的处理
  const handleModalClose = () => {
    // 关闭时恢复原始选择，保留用户状态
    setTempSelectedCustomers([...selectedCustomers]);
  };

  // 切换客户选择状态
  const handleCustomerToggle = (customer: Customer, checked: boolean) => {
    if (checked) {
      // 检查是否超过100人的限制
      if (tempSelectedCustomers.length >= 100) {
        message.warning(t('email.maxRecipientsReached', { max: 100 }));
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
      
      // 检查是否超过100人的限制
      const remainingSlots = 100 - tempSelectedCustomers.length;
      if (currentPageCustomers.length > remainingSlots) {
        message.warning(t('email.maxRecipientsReached', { max: 100 }));
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
          console.log('Date selection changed:', dates);
    if (dates && dates.length === 2) {
      const newStartDate = dates[0].toDate();
      const newEndDate = dates[1].toDate();
              console.log('Setting new date range:', { newStartDate, newEndDate });
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else {
      console.log('Clear date range');
      setStartDate(null);
      setEndDate(null);
    }
    // 时间筛选变化时重置到第一页
    setCurrentPage(1);
  };

  // 监听时间筛选变化，重新获取数据
  useEffect(() => {
    if (showCustomerModal && (startDate || endDate)) {
      console.log('Date filter changed, refetching data:', { startDate, endDate });
      fetchCustomers(currentPage, 100);
    }
  }, [startDate, endDate, showCustomerModal]); // 添加showCustomerModal依赖，确保只在模态框打开时重新获取

  // 清空时间筛选
  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    // 清空筛选时重置到第一页
    setCurrentPage(1);
    // 立即获取数据，确保状态同步
    fetchCustomers(1, 100);
  };

  // 处理搜索按钮点击
  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const values = searchForm.getFieldsValue();
    if (values.searchValue && values.searchValue.trim()) {
      // 直接执行搜索，传递当前表单值
      setSearchField(values.searchField);
      setSearchValue(values.searchValue.trim());
      setCurrentPage(1);
      // 立即获取数据，确保状态同步
      fetchCustomers(1, 100, values.searchField, values.searchValue.trim());
    }
  };

  // 处理搜索字段变化
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    setSearchValue(''); // 清空搜索值
    searchForm.setFieldsValue({ searchValue: '' }); // 清空表单中的搜索值
    setCurrentPage(1);
    // 移除自动刷新列表，只更新状态
    // 不再自动获取数据，等待用户点击搜索按钮
  };

      // 清空搜索
    const handleClearSearch = () => {
      setSearchField('company_name');
      setSearchValue('');
      searchForm.resetFields();
      setCurrentPage(1);
      // 立即获取数据，确保状态同步
      fetchCustomers(1, 100, 'company_name', '');
    };

  // 处理模板选择
  const handleTemplateSelect = (template: EmailTemplate) => {
    // 获取当前HTML编辑框的内容
    const currentContent = form.getFieldValue('content') || '';
    
    // 提取模板中的body内容，移除完整的HTML文档结构
    let templateContent = template.content;
    
    // 如果模板包含完整的HTML文档结构，只提取body内的内容
    if (templateContent.includes('<body') && templateContent.includes('</body>')) {
      const bodyMatch = templateContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        templateContent = bodyMatch[1].trim();
      }
    }
    
    // 检查是否已经应用过这个模板
    const templateSignature = template.id + '_' + template.name;
    const appliedTemplates = currentContent.match(/<!-- Template: ([^>]+) -->/g) || [];
    
    // 检查是否已经应用过这个模板
    const isAlreadyApplied = appliedTemplates.some((signature: string) => 
      signature.includes(templateSignature)
    );
    
    if (isAlreadyApplied) {
      message.warning(`模板 "${template.name}" 已经应用过了，避免重复应用`);
      setShowTemplateModal(false);
      return;
    }
    
    // 在光标位置插入模板内容，如果没有光标位置则插入到末尾
    const templateWithSignature = `<!-- Template: ${templateSignature} -->\n${templateContent}`;
    const newContent = currentContent + '\n\n' + templateWithSignature;
    
    // 准备更新的表单字段
    const updateFields: any = {
      content: newContent
    };
    
    // 只有当模板的subject不为空时才应用到主题字段
    if (template.subject && template.subject.trim()) {
      updateFields.subject = template.subject;
    }
    
    // 更新表单内容
    form.setFieldsValue(updateFields);
    
    // 设置HTML内容标识
    setIsHtmlContent(true);
    
    // 关闭模板选择模态框
    setShowTemplateModal(false);
    
    message.success(`模板 "${template.name}" 已插入到编辑框`);
  };

  // 处理部门模板一键应用
  const handleDepartmentTemplate = (department: '一部' | '二部' | '三部' | 'AG') => {
    // 获取当前HTML编辑框的内容
    const currentContent = form.getFieldValue('content') || '';
    
    // 检查是否已经应用过部门模板
    const departmentSignature = `department_${department}`;
    const appliedTemplates = currentContent.match(/<!-- Template: ([^>]+) -->/g) || [];
    const isAlreadyApplied = appliedTemplates.some((signature: string) => 
      signature.includes(departmentSignature)
    );
    
    if (isAlreadyApplied) {
      message.warning(`${department}模板已经应用过了，避免重复应用`);
      return;
    }
    
    if (department === 'AG') {
      // AG模板是完整的模板，不需要组合
      const agTemplate = EMAIL_TEMPLATES.find(t => t.id === 'ag');
      
      if (!agTemplate) {
        message.error('AG模板配置错误，请联系管理员');
        return;
      }
      
      // 提取AG模板内容
      let agContent = agTemplate.content;
      if (agContent.includes('<body') && agContent.includes('</body>')) {
        const bodyMatch = agContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          agContent = bodyMatch[1].trim();
        }
      }
      
      // 更新表单内容
      const newContent = currentContent + '\n\n' + `<!-- Template: ${departmentSignature} -->\n${agContent}`;
      form.setFieldsValue({
        content: newContent,
        subject: agTemplate.subject || ''
      });
      
      // 设置HTML内容标识
      setIsHtmlContent(true);
      
      message.success('AG模板已一键应用（完整模板）');
    } else {
      // 其他部门模板需要组合header、main、footer
      const headerTemplate = EMAIL_TEMPLATES.find(t => t.id === 'db-header');
      const mainTemplate = EMAIL_TEMPLATES.find(t => t.id === 'db');
      const footerTemplate = EMAIL_TEMPLATES.find(t => 
        (department === '一部' && t.id === 'db-footer-1') ||
        (department === '二部' && t.id === 'db-footer-2') ||
        (department === '三部' && t.id === 'db-footer-3')
      );
      
      if (!headerTemplate || !mainTemplate || !footerTemplate) {
        message.error('模板配置错误，请联系管理员');
        return;
      }
      
      // 组合模板内容
      let combinedContent = '';
      
      // 添加页头模板
      let headerContent = headerTemplate.content;
      if (headerContent.includes('<body') && headerContent.includes('</body>')) {
        const bodyMatch = headerContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          headerContent = bodyMatch[1].trim();
        }
      }
      combinedContent += `<!-- Template: ${departmentSignature}_header -->\n${headerContent}\n\n`;
      
      // 添加主模板
      let mainContent = mainTemplate.content;
      if (mainContent.includes('<body') && mainContent.includes('</body>')) {
        const bodyMatch = mainContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          mainContent = bodyMatch[1].trim();
        }
      }
      combinedContent += `<!-- Template: ${departmentSignature}_main -->\n${mainContent}\n\n`;
      
      // 添加页脚模板
      let footerContent = footerTemplate.content;
      if (footerContent.includes('<body') && footerContent.includes('</body>')) {
        const bodyMatch = footerContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          footerContent = bodyMatch[1].trim();
        }
      }
      combinedContent += `<!-- Template: ${departmentSignature}_footer -->\n${footerContent}`;
      
      // 更新表单内容
      const newContent = currentContent + '\n\n' + combinedContent;
      form.setFieldsValue({
        content: newContent,
        subject: mainTemplate.subject || ''
      });
      
      // 设置HTML内容标识
      setIsHtmlContent(true);
      
      message.success(`${department}模板已一键应用（页头+主内容+${department}页脚）`);
    }
  };

  // 处理模板预览
  const handleTemplatePreview = (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  // 应用模板
  const handleApplyTemplate = () => {
    if (previewTemplate) {
      handleTemplateSelect(previewTemplate);
      setShowPreviewModal(false);
      setPreviewTemplate(null);
    }
  };

  // 清除模板标记，允许重新应用模板
  const clearTemplateSignatures = () => {
    const currentContent = form.getFieldValue('content') || '';
    const cleanedContent = currentContent.replace(/<!-- Template: [^>]+ -->\n/g, '');
    form.setFieldsValue({
      content: cleanedContent
    });
    message.success('已清除模板标记，可以重新应用模板');
  };

  // 清除部门模板标记，允许重新应用部门模板
  const clearDepartmentTemplateSignatures = () => {
    const currentContent = form.getFieldValue('content') || '';
    const cleanedContent = currentContent.replace(/<!-- Template: department_[^>]+ -->\n/g, '');
    form.setFieldsValue({
      content: cleanedContent
    });
    message.success('已清除部门模板标记，可以重新应用部门模板');
  };

  const handleSubmit = async (values: {
    to: string;
    subject: string;
    content: string;
  }) => {
    if (!values.subject.trim() || !values.content.trim()) {
      message.error(t('email.subjectRequired') + ' ' + t('email.subjectRequired') + ' ' + t('email.contentRequired'));
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

    // 智能处理内容：如果包含HTML标签或标记为HTML内容，直接使用；否则转换为HTML
    let htmlContent;
    if (isHtmlContent || (values.content.includes('<') && values.content.includes('>'))) {
      // 检测到HTML标签或标记为HTML内容，直接使用
      htmlContent = values.content;
    } else {
      // 纯文本，转换为HTML格式
      htmlContent = textToHtml(values.content);
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
            content: htmlContent,
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
      console.error('Failed to submit approval request:', error);
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

  // 渲染模板卡片
  const renderTemplateCards = () => {
    return (
      <div className="max-h-[272px] overflow-y-auto p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMAIL_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              hoverable
              size="small"
              className="cursor-pointer transition-all duration-200 m-1 hover:shadow-md"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    <p className="truncate"><strong>主题：</strong>{template.subject}</p>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <TemplateOutlined className="text-blue-500 text-lg" />
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-blue-200">
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<EyeOutlined />}
                  onClick={(e) => handleTemplatePreview(template, e)}
                  className="text-xs"
                >
                  预览
                </Button>
              </div>
            </Card>
          ))}
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
                    {t('customer.customersSelected', { count: selectedCustomers.length })} / 100
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
            label={
              <div className="flex items-center justify-between">
                <span>{t('email.emailContent')}</span>
                <div className="flex items-center gap-2 ml-2">
                  {isHtmlContent && (
                    <Tooltip title={t('email.htmlContentDetected')}>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        HTML
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip title={t('email.htmlSupported')}>
                    <CodeOutlined className="text-blue-500" />
                  </Tooltip>
                </div>
              </div>
            }
            rules={[{ required: true, message: t('email.contentRequired') }]}
            className="flex-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EditOutlined />
                  <span>HTML编辑</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleDepartmentTemplate('一部')}
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                  >
                    一部
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleDepartmentTemplate('二部')}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    二部
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleDepartmentTemplate('三部')}
                    style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                  >
                    三部
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleDepartmentTemplate('AG')}
                    style={{ backgroundColor: '#00C3D0', borderColor: '#00C3D0' }}
                  >
                    AG
                  </Button>
                  <Button
                    type="default"
                    icon={<TemplateOutlined />}
                    onClick={() => setShowTemplateModal(true)}
                    size="small"
                  >
                    {t('email.insertTemplate')}
                  </Button>
                </div>
              </div>
              <Form.Item name="content" noStyle>
                <TextArea
                  rows={12}
                  placeholder={isHtmlContent ? t('email.htmlContentPlaceholder') : t('email.contentPlaceholderWithHtml')}
                  showCount
                  maxLength={10000}
                  onChange={(e) => {
                    // 检测用户输入的内容是否包含HTML标签
                    const content = e.target.value;
                    const hasHtmlTags = content.includes('<') && content.includes('>');
                    if (hasHtmlTags && !isHtmlContent) {
                      setIsHtmlContent(true);
                    }
                  }}
                />
              </Form.Item>
            </div>
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
            disabled={false}
          >
            {isSending ? t('email.submitting') : t('email.submitForApproval')}
          </Button>
        </Form.Item>
      </Form>

      {/* 模板预览模态框 */}
      <Modal
        title={`模板预览 - ${previewTemplate?.name}`}
        open={showPreviewModal}
        onOk={handleApplyTemplate}
        onCancel={() => {
          setShowPreviewModal(false);
          setPreviewTemplate(null);
        }}
        width={800}
        okText="应用此模板"
        cancelText="关闭"
        okButtonProps={{
          type: 'primary'
        }}
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">模板信息</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>模板名称：</strong>{previewTemplate.name}</p>
                <p><strong>模板分类：</strong>{previewTemplate.category}</p>
                <p><strong>邮件主题：</strong>{previewTemplate.subject}</p>
                <p><strong>模板描述：</strong>{previewTemplate.description}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">邮件内容预览</h3>
              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <div 
                  className="email-preview"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 模板选择模态框 */}
      <Modal
        title={t('email.selectTemplate')}
        open={showTemplateModal}
        onCancel={() => setShowTemplateModal(false)}
        footer={[
          <Button key="clear" onClick={clearTemplateSignatures} type="default">
            清除模板标记
          </Button>,
          <Button key="clearDept" onClick={clearDepartmentTemplateSignatures} type="default">
            清除部门模板标记
          </Button>,
          <Button key="cancel" onClick={() => setShowTemplateModal(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {t('email.templateSelectionDescription')}
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>提示：</strong>每个模板只能应用一次，如需重新应用请点击"清除模板标记"
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>部门模板说明：</strong>点击页面上的"一部"、"二部"、"三部"按钮可一键应用完整的部门模板（页头+主内容+对应部门页脚），"AG"按钮可一键应用完整的AG模板
            </div>
          </div>
          {renderTemplateCards()}
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
        okButtonProps={{
          disabled: tempSelectedCustomers.length === 0
        }}
        afterClose={handleModalClose}
        maskClosable={false}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {t('customer.customersSelected', { count: tempSelectedCustomers.length })}
            {tempSelectedCustomers.length >= 100 && (
              <span className="text-orange-600 ml-2">
                ({t('email.maxRecipientsLimit', { max: 100 })})
              </span>
            )}
          </div>
          
          {/* 限制提示 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>{t('email.recipientsLimitNotice', { max: 100 })}</strong>
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
          
          {/* 搜索功能 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">{t('common.searchCustomer')}</span>
              {(searchValue) && (
                <Button 
                  size="small" 
                  type="text" 
                  onClick={handleClearSearch}
                >
                  {t('common.clearFilter')}
                </Button>
              )}
            </div>
            <Form
              form={searchForm}
              layout="inline"
              className="flex items-center gap-2"
            >
              <Form.Item name="searchField" initialValue="company_name" className="mb-0">
                <Select
                  style={{ width: 100 }}
                  size="small"
                  onChange={handleSearchFieldChange}
                  options={[
                    { label: t('customer.companyName'), value: 'company_name' },
                    { label: t('customer.customerEmail'), value: 'email' },
                    { label: t('customer.fax'), value: 'fax' },
                    { label: t('customer.address'), value: 'address' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="searchValue" className="mb-0 flex-1">
                <Input
                  placeholder={t('common.searchPlaceholder')}
                  allowClear
                  size="small"
                  style={{ width: 200 }}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 移除自动搜索，只在点击搜索按钮时搜索
                  }}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    const values = searchForm.getFieldsValue();
                    if (values.searchValue && values.searchValue.trim()) {
                                          // 直接执行搜索，传递当前表单值
                    setSearchField(values.searchField);
                    setSearchValue(values.searchValue.trim());
                    setCurrentPage(1);
                    fetchCustomers(1, 100, values.searchField, values.searchValue.trim());
                    }
                  }}
                />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" onClick={handleSearchClick} size="small">
                  {t('common.search')}
                </Button>
              </Form.Item>
            </Form>
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
                      onClick={() => fetchCustomers(currentPage - 1, 100)}
                    >
                      {t('common.previous')}
                    </Button>
                    
                    {/* 页码输入 */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">{t('common.page')}:</span>
                      <Input
                        size="small"
                        style={{ width: 60 }}
                        value={tempPageInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTempPageInput(value);
                          // 移除防抖调用，只在输入时更新状态，不触发跳转
                        }}
                        onPressEnter={(e) => {
                          const value = (e.target as HTMLInputElement).value;
                          if (value === '') {
                            return;
                          }
                          const page = parseInt(value);
                          if (page && page > 0 && page <= Math.ceil(total / 100)) {
                            setCurrentPage(page);
                            setTempPageInput(page.toString());
                            fetchCustomers(page, 100);
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          const page = parseInt(tempPageInput);
                          if (page && page > 0 && page <= Math.ceil(total / 100)) {
                            setCurrentPage(page);
                            setTempPageInput(page.toString());
                            fetchCustomers(page, 100);
                          }
                        }}
                      >
                        {t('common.confirm')}
                      </Button>
                      <span className="text-sm text-gray-600">/ {Math.ceil(total / pageSize)}</span>
                    </div>
                    
                    <Button
                      size="small"
                      disabled={currentPage >= Math.ceil(total / 100)}
                      onClick={() => fetchCustomers(currentPage + 1, 100)}
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