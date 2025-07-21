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
  Spin
} from 'antd';
import { PlusOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

interface Customer {
  id: string;
  company_name: string;
  email: string;
  created_at: string;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user, userRole } = useAuth();
  const { t } = useI18n();
  
  // Modal 相关状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
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

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            size="large"
          >
            {t('customer.createCustomer')}
          </Button>
        </div>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('common.totalRecords', { total }),
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
    </div>
  );
} 