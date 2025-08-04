'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { debounce } from '@/lib/utils';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Table, 
  message, 
  Space,
  Modal,
  Spin,
  Popconfirm,
  Tooltip,
  Upload,
  Badge,
  Select,
  Checkbox,
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { PlusOutlined, UserOutlined, TeamOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, SendOutlined, CopyOutlined } from '@ant-design/icons';

interface Customer {
  id: string;
  company_name: string;
  email: string;
  fax?: string;
  address?: string;
  fax_status?: 'active' | 'inactive';
  unsubscribe?: boolean; // 订阅状态
  unsubscribe_at?: string; // 退订时间
  created_at: string;
  has_unread_emails?: boolean; // 添加未读邮件标记
}

interface ExcelCustomer {
  company_name: string;
  email: string;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user, userRole } = useAuth();
  const { t } = useI18n();
  
  // 新增：多选相关状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [batchFaxLoading, setBatchFaxLoading] = useState(false);
  
  // 错误消息国际化处理函数
  const getErrorMessage = (errorCode: string, details?: string) => {
    switch (errorCode) {
      case 'AUTH_REQUIRED':
        return t('customer.authRequired');
      case 'FILE_NOT_FOUND':
        return t('customer.fileNotFound');
      case 'INVALID_FILE_TYPE':
        return t('customer.onlyExcelAllowed');
      case 'FILE_TOO_LARGE':
        return t('customer.fileTooLarge');
      case 'INSUFFICIENT_DATA':
        return t('customer.insufficientData');
      case 'MISSING_COMPANY_COLUMN':
        return t('customer.missingCompanyColumn', { details });
      case 'MISSING_EMAIL_COLUMN':
        return t('customer.missingEmailColumn', { details });
      case 'VALIDATION_FAILED':
        return t('customer.validationFailed', { details });
      case 'NO_VALID_DATA':
        return t('customer.noValidData');
      case 'CHECK_EXISTING_ERROR':
        return t('customer.checkExistingError');
      case 'ALL_EMAILS_EXIST':
        return t('customer.allEmailsExist');
      case 'INSERT_ERROR':
        return t('customer.insertError');
      case 'PROCESSING_ERROR':
        return t('customer.processingError');
      default:
        return t('customer.bulkUploadFailed');
    }
  };
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  
  // 搜索相关状态
  const [searchField, setSearchField] = useState('company_name');
  const [searchValue, setSearchValue] = useState('');
  const [searchForm] = Form.useForm();
  
  // 移除防抖搜索函数，改为手动搜索
  
  // 新增：传真筛选状态
  const [showFaxOnly, setShowFaxOnly] = useState(false);
  // 新增：订阅状态筛选
  const [subscriptionStatus, setSubscriptionStatus] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  
  // 新增：创建时间筛选状态
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // 新增：导出传真相关状态
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportedFaxNumbers, setExportedFaxNumbers] = useState<string>('');
  
  // Modal 相关状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Excel上传相关状态
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 新增：带传真筛选的获取客户函数
  const fetchCustomersWithFaxFilter = async (page = currentPage, size = pageSize, faxOnly = showFaxOnly, subscriptionStatusParam = subscriptionStatus, searchFieldParam?: string, searchValueParam?: string, startDateParam?: Date | null, endDateParam?: Date | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        searchField: searchFieldParam !== undefined ? searchFieldParam : searchField,
        searchValue: searchValueParam !== undefined ? searchValueParam : searchValue
      });
      
      // 添加传真筛选参数 - 使用传入的 faxOnly 参数，而不是状态
      if (faxOnly) {
        params.append('hasFaxOnly', 'true');
      }
      
      // 添加订阅状态筛选参数
      if (subscriptionStatusParam !== 'all') {
        params.append('subscriptionStatus', subscriptionStatusParam);
      }
      
      // 添加创建时间筛选参数
      const startDateToUse = startDateParam !== undefined ? startDateParam : startDate;
      const endDateToUse = endDateParam !== undefined ? endDateParam : endDate;
      
      if (startDateToUse) {
        params.append('startDate', startDateToUse.toISOString());
      }
      if (endDateToUse) {
        params.append('endDate', endDateToUse.toISOString());
      }
      
      console.log('Fetch customers with fax filter:', { faxOnly, startDateToUse, endDateToUse, params: params.toString() });
      
      const response = await fetch(`/api/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
        setTotal(data.total);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 修改原有的fetchCustomers函数，使用新的函数
  const fetchCustomers = async (page = currentPage, size = pageSize, searchFieldParam?: string, searchValueParam?: string) => {
    return fetchCustomersWithFaxFilter(page, size, showFaxOnly, subscriptionStatus, searchFieldParam, searchValueParam, startDate, endDate);
  };

  // 新增：处理多选变化
  const handleSelectionChange = (selectedKeys: React.Key[], selectedRows: Customer[]) => {
    setSelectedRowKeys(selectedKeys);
    setSelectedCustomers(selectedRows);
  };

  // 新增：批量发送传真
  const handleBatchSendFax = async () => {
    if (selectedCustomers.length === 0) {
      message.warning(t('customer.pleaseSelectCustomers'));
      return;
    }

    // 过滤出有传真号码且未发送的客户
    const validCustomers = selectedCustomers.filter(customer => 
      customer.fax && customer.fax_status !== 'active'
    );

    if (validCustomers.length === 0) {
      message.warning(t('customer.noValidFaxCustomers'));
      return;
    }

    Modal.confirm({
      title: t('customer.batchSendFax'),
      content: t('customer.batchFaxConfirm', { count: validCustomers.length }),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        setBatchFaxLoading(true);
        try {
          const promises = validCustomers.map(customer => 
            fetch(`/api/customers/${customer.id}/fax-status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.id}`,
              },
              body: JSON.stringify({ status: 'active' }),
            })
          );

          const results = await Promise.allSettled(promises);
          
          let successCount = 0;
          let failCount = 0;
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const response = result.value;
              if (response.ok) {
                successCount++;
              } else {
                failCount++;
              }
            } else {
              failCount++;
            }
          });

          if (successCount > 0) {
            message.success(t('customer.batchFaxSuccess', { success: successCount, total: validCustomers.length }));
            // 清空选择
            setSelectedRowKeys([]);
            setSelectedCustomers([]);
            // 刷新数据
            fetchCustomers();
          }
          
          if (failCount > 0) {
            message.warning(t('customer.batchFaxPartial', { success: successCount, fail: failCount }));
          }
        } catch (error) {
          console.error('Batch fax sending failed:', error);
          message.error(t('customer.batchFaxFailed'));
        } finally {
          setBatchFaxLoading(false);
        }
      }
    });
  };

  const handleSubmit = async (values: { company_name: string; email: string; fax?: string; address?: string }) => {
    // 自定义验证：email和fax至少需要填写一个
    if (!values.email && !values.fax) {
      message.error(t('customer.emailOrFaxRequired'));
      return;
    }

    setModalLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success(t('customer.customerCreated'));
        form.resetFields();
        setIsModalVisible(false);
        fetchCustomers();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error(t('customer.customerCreateFailed'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string, companyName: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        message.success(t('customer.customerDeleted'));
        fetchCustomers();
      } else {
        message.error(data.error || t('customer.customerDeleteFailed'));
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      message.error(t('customer.customerDeleteFailed'));
    }
  };

  // 发送传真
  const handleActivateFax = async (customerId: string) => {
    Modal.confirm({
      title: t('customer.sendFax'),
      content: t('customer.faxSendConfirm'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          const response = await fetch(`/api/customers/${customerId}/fax-status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.id}`,
            },
            body: JSON.stringify({ status: 'active' }),
          });

          const data = await response.json();
          
          if (data.success) {
            message.success(t('customer.faxSent'));
            fetchCustomers();
          } else {
            message.error(data.error || t('customer.faxSendFailed'));
          }
        } catch (error) {
          console.error('Fax activation failed:', error);
          message.error(t('customer.faxSendFailed'));
        }
      }
    });
  };

  // Excel上传处理
  const handleExcelUpload = async (file: File) => {
    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/customers/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        message.success(t('customer.bulkUploadSuccess', { count: data.importedCount }));
        setUploadModalVisible(false);
        setUploadFileList([]);
        fetchCustomers();
      } else {
        // 处理国际化的错误消息
        const errorMessage = getErrorMessage(data.error, data.details);
        message.error(errorMessage);
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      message.error(t('customer.bulkUploadFailed'));
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    fileList: uploadFileList,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error(t('customer.onlyExcelAllowed'));
        return Upload.LIST_IGNORE;
      }
      
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error(t('customer.fileTooLarge'));
        return Upload.LIST_IGNORE;
      }
      
      setUploadFileList([file]);
      return Upload.LIST_IGNORE; // 阻止自动上传
    },
    onRemove: () => {
      setUploadFileList([]);
    },
    accept: '.xlsx,.xls',
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const showUploadModal = () => {
    setUploadModalVisible(true);
    setUploadFileList([]);
  };

  const handleUploadCancel = () => {
    setUploadModalVisible(false);
    setUploadFileList([]);
  };

  const handleUploadSubmit = () => {
    if (uploadFileList.length === 0) {
      message.error(t('customer.pleaseSelectFile'));
      return;
    }
    
    const uploadFile = uploadFileList[0];
    const file = uploadFile.originFileObj;
    
    if (file) {
      handleExcelUpload(file);
    } else {
      if (uploadFile instanceof File) {
        handleExcelUpload(uploadFile);
      }
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/api/customers/download-template';
    link.download = 'customer_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 新增：处理传真筛选切换
  const handleFaxOnlyChange = (checked: boolean) => {
    setShowFaxOnly(checked);
    setCurrentPage(1);
    // 直接传递checked参数，而不是依赖状态
    fetchCustomersWithFaxFilter(1, pageSize, checked, subscriptionStatus, searchField, searchValue, startDate, endDate);
  };

  // 处理创建时间筛选变化
  const handleDateRangeChange = (dates: any) => {
    let newStartDate: Date | null = null;
    let newEndDate: Date | null = null;
    
    if (dates && dates.length === 2) {
      newStartDate = dates[0].toDate();
      newEndDate = dates[1].toDate();
      setStartDate(newStartDate);
      setEndDate(newEndDate);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
    // 时间筛选变化时重置到第一页
    setCurrentPage(1);
    // 立即获取数据，使用新的时间值
    fetchCustomersWithFaxFilter(1, pageSize, showFaxOnly, subscriptionStatus, searchField, searchValue, newStartDate, newEndDate);
  };

  // 清空时间筛选
  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    // 清空筛选时重置到第一页
    setCurrentPage(1);
    // 立即获取数据，使用清空后的时间值
    fetchCustomersWithFaxFilter(1, pageSize, showFaxOnly, subscriptionStatus, searchField, searchValue, null, null);
  };

  // 导出传真号码
  const handleExportFaxNumbers = () => {
    if (selectedCustomers.length === 0) {
      message.warning(t('customer.pleaseSelectCustomers'));
      return;
    }

    // 过滤出有传真号码的客户
    const customersWithFax = selectedCustomers.filter(customer => customer.fax && customer.fax.trim());
    
    if (customersWithFax.length === 0) {
      message.warning(t('customer.noValidFaxCustomers'));
      return;
    }

    // 提取传真号码并格式化为指定格式
    const faxNumbers = customersWithFax.map(customer => customer.fax).join(',');
    setExportedFaxNumbers(faxNumbers);
    setExportModalVisible(true);
  };

  // 复制传真号码到剪贴板
  const handleCopyFaxNumbers = async () => {
    try {
      await navigator.clipboard.writeText(exportedFaxNumbers);
      message.success(t('customer.faxNumbersCopied'));
    } catch (error) {
      console.error('复制失败:', error);
      message.error(t('customer.copyFailed'));
    }
  };


  // 处理搜索字段变化
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    setSearchValue(''); // 清空搜索值
    searchForm.setFieldsValue({ searchValue: '' }); // 清空表单中的搜索值
    setCurrentPage(1);
    // 重新获取数据，确保状态同步
    fetchCustomersWithFaxFilter(1, pageSize, showFaxOnly, subscriptionStatus, value, '');
  };

  // 移除这个useEffect，因为它会干扰手动调用
  // useEffect(() => {
  //   // 当搜索状态发生变化时，自动获取数据
  //   // 注意：移除 searchField 依赖，避免切换搜索字段时自动刷新
  //   if (!loading) {
  //     fetchCustomersWithFaxFilter(currentPage, pageSize, showFaxOnly, subscriptionStatus, searchField, searchValue);
  //   }
  // }, [searchValue, showFaxOnly, subscriptionStatus, currentPage, pageSize]); // 移除 searchField 依赖

  // 简化清空搜索函数
  const handleClearSearch = () => {
    setSearchField('company_name');
    setSearchValue('');
    setShowFaxOnly(false);
    setSubscriptionStatus('all');
    setStartDate(null);
    setEndDate(null);
    searchForm.resetFields();
    setCurrentPage(1);
    // 立即调用获取数据，确保状态同步
    fetchCustomersWithFaxFilter(1, pageSize, false, 'all', 'company_name', '', null, null);
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
      // 立即调用搜索，确保状态同步
      fetchCustomersWithFaxFilter(1, pageSize, showFaxOnly, subscriptionStatus, values.searchField, values.searchValue.trim(), startDate, endDate);
    }
  };

  const columns = [
    {
      title: t('customer.customerName'),
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text: string, record: Customer) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: t('customer.customerEmail'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('customer.fax'),
      dataIndex: 'fax',
      key: 'fax',
      render: (fax: string) => fax || '-',
    },
    {
      title: t('customer.address'),
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => {
        if (!address) return '-';
        return (
          <Tooltip title={address} placement="topLeft">
            <div className="max-w-[200px] truncate cursor-help">
              {address}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: t('customer.faxStatus'),
      dataIndex: 'fax_status',
      key: 'fax_status',
      render: (status: string, record: Customer) => {
        if (!record.fax) return '-';
        
        if (status === 'inactive' || !status) {
          return (userRole === 'admin' || userRole === 'employee') ? (
            <Button
              type="primary"
              size="small"
              onClick={() => handleActivateFax(record.id)}
            >
              {t('customer.sendFax')}
            </Button>
          ) : (
            <span className="text-gray-500">{t('customer.faxStatusInactive')}</span>
          );
        }
        
        return (
          <span className="text-green-600 font-medium">{t('customer.faxStatusActive')}</span>
        );
      },
    },
    {
      title: t('customer.subscriptionStatus'),
      dataIndex: 'unsubscribe',
      key: 'unsubscribe',
      render: (unsubscribe: boolean, record: Customer) => {
        if (!record.email) return '-';
        
        if (unsubscribe) {
          return (
            <span className="text-red-600 font-medium">
              {t('customer.unsubscribed')}
            </span>
          );
        }
        
        return (
          <span className="text-green-600 font-medium">
            {t('customer.subscribed')}
          </span>
        );
      },
    },
    {
      title: t('customer.creationTime'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Space>
          {userRole === 'admin' && (
            <Tooltip title={t('customer.deleteCustomer')}>
              <Popconfirm
                title={t('customer.deleteConfirmTitle')}
                description={t('customer.deleteConfirmDescription', { name: record.company_name })}
                onConfirm={() => handleDeleteCustomer(record.id, record.company_name)}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
                okType="danger"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={t('navigation.customerManagement')} className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-xl" />
            <span className="text-lg font-medium">{t('customer.customerList')}</span>
          </div>
          <Space>
            {/* 新增：批量操作按钮 */}
            {selectedCustomers.length > 0 && (
              <Space>
                {/* 导出传真号码按钮 */}
                <Button
                  type="default"
                  icon={<CopyOutlined />}
                  onClick={handleExportFaxNumbers}
                  size="large"
                >
                  {t('customer.exportFaxNumbers')} ({selectedCustomers.length})
                </Button>
                
                {/* 批量发送传真按钮 */}
                {(userRole === 'admin' || userRole === 'employee') && (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleBatchSendFax}
                    loading={batchFaxLoading}
                    size="large"
                  >
                    {t('customer.batchSendFax')} ({selectedCustomers.length})
                  </Button>
                )}
              </Space>
            )}
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={showUploadModal}
              size="large"
            >
              {t('customer.bulkUpload')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              size="large"
            >
              {t('customer.createCustomer')}
            </Button>
          </Space>
        </div>

        {/* 搜索区域 */}
        <div className="mb-6">
          <Form
            form={searchForm}
            layout="inline"
            className="flex items-center gap-4"
          >
            <Form.Item name="searchField" initialValue="company_name">
              <Select
                style={{ width: 120 }}
                onChange={handleSearchFieldChange}
                options={[
                  { label: t('customer.companyName'), value: 'company_name' },
                  { label: t('customer.customerEmail'), value: 'email' },
                  { label: t('customer.fax'), value: 'fax' },
                  { label: t('customer.address'), value: 'address' },
                ]}
              />
            </Form.Item>
            <Form.Item name="searchValue" className="flex-1">
              <Input
                placeholder={t('common.search')}
                style={{ width: 300 }}
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
                    fetchCustomers(1, pageSize, values.searchField, values.searchValue.trim());
                  }
                }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSearchClick}>
                  {t('common.search')}
                </Button>
                <Button onClick={handleClearSearch}>
                  {t('common.clearFilter')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
          
          {/* 新增：传真筛选复选框 */}
          <div className="mt-4 flex items-center gap-4">
            <Checkbox
              checked={showFaxOnly}
              onChange={(e) => handleFaxOnlyChange(e.target.checked)}
            >
              {t('customer.showFaxOnly')}
            </Checkbox>
            
            {/* 新增：订阅状态筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('customer.subscriptionStatus')}:</span>
              <Select
                value={subscriptionStatus}
                onChange={(value) => {
                  setSubscriptionStatus(value);
                  setCurrentPage(1);
                  // 立即获取数据，确保状态同步
                  fetchCustomersWithFaxFilter(1, pageSize, showFaxOnly, value, searchField, searchValue, startDate, endDate);
                }}
                style={{ width: 120 }}
                size="small"
                options={[
                  { label: t('common.all'), value: 'all' },
                  { label: t('customer.subscribed'), value: 'subscribed' },
                  { label: t('customer.unsubscribed'), value: 'unsubscribed' },
                ]}
              />
            </div>
            
            {/* 新增：创建时间筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('customer.createdAt')}:</span>
              <DatePicker.RangePicker
                value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
                onChange={handleDateRangeChange}
                size="small"
                style={{ width: 240 }}
                placeholder={[t('customer.startDate'), t('customer.endDate')]}
                format="YYYY-MM-DD"
              />
              <Button 
                size="small" 
                onClick={handleClearDateFilter}
                disabled={!startDate && !endDate}
              >
                {t('common.clear')}
              </Button>
            </div>
          </div>
        </div>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          // 新增：多选配置
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
            getCheckboxProps: (record: Customer) => ({
              // 只有有传真号码的客户才能被选择
              disabled: !record.fax,
            }),
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: {
              goButton: true
            },
            showTotal: (total) => t('common.totalRecords', { total }),
            onChange: (page, size) => {
              fetchCustomersWithFaxFilter(page, size, showFaxOnly, subscriptionStatus, searchField, searchValue, startDate, endDate);
            },
            onShowSizeChange: (current, size) => {
                              fetchCustomersWithFaxFilter(1, size, showFaxOnly, subscriptionStatus, searchField, searchValue, startDate, endDate);
            },
            itemRender: (page, type, originalElement) => {
              if (type === 'page') {
                return (
                  <Button
                    type={page === currentPage ? 'primary' : 'default'}
                    size="small"
                    onClick={() => fetchCustomersWithFaxFilter(page, pageSize, showFaxOnly, subscriptionStatus, searchField, searchValue, startDate, endDate)}
                  >
                    {page}
                  </Button>
                );
              }
              return originalElement;
            },
          }}
          locale={{
            emptyText: t('customer.noCustomers'),
          }}
        />
      </Card>

      {/* 导出传真号码 Modal */}
      <Modal
        title={t('customer.exportFaxNumbers')}
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyFaxNumbers}>
            {t('customer.copyToClipboard')}
          </Button>,
          <Button key="close" onClick={() => setExportModalVisible(false)}>
            {t('common.close')}
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('customer.exportedFaxNumbers')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('customer.exportDescription')}</p>
            <div className="border rounded-lg p-4 bg-gray-50">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {exportedFaxNumbers}
              </pre>
            </div>
          </div>
        </div>
      </Modal>

      {/* 创建客户 Modal */}
      <Modal
        title={t('customer.createCustomer')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="company_name"
            label={t('customer.companyName')}
            rules={[
              { required: true, message: t('customer.companyNameRequired') }
            ]}
          >
            <Input 
              placeholder={t('customer.customerNamePlaceholder')}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={t('customer.customerEmail')}
            rules={[
              { type: 'email', message: t('customer.invalidEmail') }
            ]}
          >
            <Input 
              placeholder={t('customer.emailPlaceholder')}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="fax"
            label={t('customer.fax')}
            rules={[
              { 
                pattern: /^[0-9+\-\s()]+$/, 
                message: t('customer.invalidFax') 
              }
            ]}
          >
            <Input 
              placeholder={t('customer.faxPlaceholder')}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="address"
            label={t('customer.address')}
          >
            <Input.TextArea 
              placeholder={t('customer.addressPlaceholder')}
              size="large"
              rows={3}
            />
          </Form.Item>
          
          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel} size="large">
                {t('common.cancel')}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={modalLoading}
                size="large"
              >
                {t('customer.createCustomer')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Excel批量上传 Modal */}
      <Modal
        title={t('customer.bulkUpload')}
        open={uploadModalVisible}
        onCancel={handleUploadCancel}

        footer={[
          <Button key="cancel" onClick={handleUploadCancel}>
            {t('common.cancel')}
          </Button>,
          <Button 
            key="upload" 
            type="primary" 
            loading={uploadLoading}
            onClick={handleUploadSubmit}
            disabled={uploadFileList.length === 0}
          >
            {t('customer.uploadExcel')}
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 mb-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">{t('customer.excelFormat')}</h4>
            <p className="text-sm text-blue-700 mb-2">{t('customer.excelRequirements')}</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('customer.excelColumn1')}</li>
              <li>• <span dangerouslySetInnerHTML={{ 
                __html: t('customer.excelColumn2').replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;') 
              }} /></li>
              <li>• {t('customer.excelColumnFax')}</li>
              <li>• {t('customer.excelColumnAddress')}</li>
              <li>• {t('customer.excelColumn3')}</li>
              <li>• {t('customer.excelColumn4')}</li>
              <li>• {t('customer.excelColumn5')}</li>
            </ul>
            <div className="mt-3">
              <Button 
                type="link" 
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                className="p-0 text-blue-600 hover:text-blue-800"
              >
                {t('customer.downloadTemplate')}
              </Button>
            </div>
          </div>
          
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="large" block>
              {t('customer.selectExcelFile')}
            </Button>
          </Upload>
          
        </div>
      </Modal>
    </div>
  );
} 