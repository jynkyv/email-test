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
  Upload
} from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { PlusOutlined, UserOutlined, TeamOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

interface Customer {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
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

  const fetchCustomers = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers?page=${page}&pageSize=${size}`, {
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
      console.error('获取客户列表失败:', error);
      message.error(t('customer.fetchCustomersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { company_name: string; email: string }) => {
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
      console.error('删除客户失败:', error);
      message.error(t('customer.customerDeleteFailed'));
    }
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
      console.error('批量上传失败:', error);
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

  const columns = [
    {
      title: t('customer.customerName'),
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: t('customer.customerEmail'),
      dataIndex: 'email',
      key: 'email',
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
            showQuickJumper: true,
            showTotal: (total) => t('common.totalRecords', { total }),
            onChange: (page, size) => {
              fetchCustomers(page, size);
            },
            onShowSizeChange: (current, size) => {
              fetchCustomers(1, size);
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
              { required: true, message: t('customer.emailRequired') },
              { type: 'email', message: t('customer.invalidEmail') }
            ]}
          >
            <Input 
              placeholder={t('customer.emailPlaceholder')}
              size="large"
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
              <li>• {t('customer.excelColumn2')}</li>
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