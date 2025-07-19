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
  Tag,
  Spin 
} from 'antd';
import { PlusOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

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
  const { user } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
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
        fetchCustomers();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error(t('customer.customerCreateFailed'));
    }
  };

  const columns = [
    {
      title: t('customer.companyName'),
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
      render: (text: string) => (
        <Space>
          <MailOutlined />
          {text}
        </Space>
      ),
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
      <Card title={t('customer.createCustomer')} className="shadow-lg">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="company_name"
              label={t('customer.companyName')}
              rules={[{ required: true, message: t('customer.companyNameRequired') }]}
            >
              <Input placeholder={t('customer.customerNamePlaceholder')} />
            </Form.Item>
            
            <Form.Item
              name="email"
              label={t('customer.customerEmail')}
              rules={[
                { required: true, message: t('customer.emailRequired') },
                { type: 'email', message: t('customer.invalidEmail') }
              ]}
            >
              <Input placeholder={t('customer.emailPlaceholder')} />
            </Form.Item>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              {t('customer.createCustomer')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title={t('customer.customerList')} className="shadow-lg">
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
    </div>
  );
} 