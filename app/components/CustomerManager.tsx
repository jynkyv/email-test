'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
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
  Checkbox
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { PlusOutlined, UserOutlined, TeamOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

interface Customer {
  id: string;
  company_name: string;
  email: string;
  fax?: string;
  address?: string;
  fax_status?: 'active' | 'inactive';
  unsubscribe?: boolean; // 订阅状态：true表示已退订，false表示订阅中
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
  
  // 新增：传真筛选状态
  const [showFaxOnly, setShowFaxOnly] = useState(false);
  
  // 新增：订阅状态筛选
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  
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

  // 新增：带筛选的获取客户函数
  const fetchCustomersWithFilters = async (page = currentPage, size = pageSize, faxOnly = showFaxOnly, subscriptionFilterParam = subscriptionFilter, searchFieldParam?: string, searchValueParam?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        searchField: searchFieldParam || searchField,
        searchValue: searchValueParam || searchValue
      });
      
      // 添加传真筛选参数
      if (faxOnly) {
        params.append('hasFaxOnly', 'true');
      }
      
      // 添加订阅状态筛选参数
      if (subscriptionFilterParam !== 'all') {
        params.append('subscriptionStatus', subscriptionFilterParam);
      }
      
      console.log('Fetch customers with filters:', { faxOnly, subscriptionFilterParam, params: params.toString() });
      
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
    return fetchCustomersWithFilters(page, size, showFaxOnly, subscriptionFilter, searchFieldParam, searchValueParam);
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
    fetchCustomersWithFilters(1, pageSize, checked, subscriptionFilter);
  };


  // 处理搜索字段变化
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    setSearchValue(''); // 清空搜索值
    searchForm.setFieldsValue({ searchValue: '' }); // 清空表单中的搜索值
    // 不重新获取数据，只是清空搜索条件
  };

  // 修改 useEffect，移除 searchField 依赖，避免切换搜索字段时自动刷新
  useEffect(() => {
    // 当搜索状态发生变化时，自动获取数据
    // 注意：移除 searchField 依赖，避免切换搜索字段时自动刷新
    if (!loading) {
      fetchCustomersWithFilters(currentPage, pageSize, showFaxOnly, subscriptionFilter, searchField, searchValue);
    }
  }, [searchValue, showFaxOnly, subscriptionFilter, currentPage, pageSize]); // 移除 searchField 依赖

  // 简化清空搜索函数
  const handleClearSearch = () => {
    setSearchField('company_name');
    setSearchValue('');
    setShowFaxOnly(false);
    setSubscriptionFilter('all');
    searchForm.resetFields();
    setCurrentPage(1);
    // 不需要手动调用 fetchCustomers，useEffect 会自动处理
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
      // 手动调用搜索，因为 useEffect 不会监听 searchField 变化
      fetchCustomers(1, pageSize, values.searchField, values.searchValue.trim());
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
        if (unsubscribe) {
          return (
            <Space>
              <Badge status="error" />
              <span className="text-red-600 font-medium">{t('customer.unsubscribed')}</span>
              {record.unsubscribe_at && (
                <Tooltip title={new Date(record.unsubscribe_at).toLocaleString()}>
                  <span className="text-xs text-gray-500">
                    ({new Date(record.unsubscribe_at).toLocaleDateString()})
                  </span>
                </Tooltip>
              )}
            </Space>
          );
        } else {
          return (
            <Space>
              <Badge status="success" />
              <span className="text-green-600 font-medium">{t('customer.subscribed')}</span>
            </Space>
          );
        }
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
          <div className="mt-4 flex items-center gap-6">
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
                value={subscriptionFilter}
                onChange={(value) => {
                  setSubscriptionFilter(value);
                  setCurrentPage(1);
                  fetchCustomersWithFilters(1, pageSize, showFaxOnly, value);
                }}
                style={{ width: 120 }}
                options={[
                  { label: t('common.all'), value: 'all' },
                  { label: t('customer.subscribed'), value: 'subscribed' },
                  { label: t('customer.unsubscribed'), value: 'unsubscribed' },
                ]}
              />
            </div>
          </div>
        </div>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
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
              fetchCustomers(page, size);
            },
            onShowSizeChange: (current, size) => {
              fetchCustomers(1, size);
            },
            itemRender: (page, type, originalElement) => {
              if (type === 'page') {
                return (
                  <Button
                    type={page === currentPage ? 'primary' : 'default'}
                    size="small"
                    onClick={() => fetchCustomers(page, pageSize)}
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