'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
      message.error('获取客户列表失败');
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
        message.success('客户创建成功');
        form.resetFields();
        fetchCustomers();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error('创建客户失败');
    }
  };

  const columns = [
    {
      title: '企业名称',
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
      title: '邮箱',
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
      title: '创建时间',
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
      <Card title="创建新客户" className="shadow-lg">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="company_name"
              label="企业名称"
              rules={[{ required: true, message: '请输入企业名称!' }]}
            >
              <Input placeholder="请输入企业名称" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input placeholder="请输入邮箱地址" />
            </Form.Item>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              创建客户
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="客户列表" className="shadow-lg">
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText: '暂无客户',
          }}
        />
      </Card>
    </div>
  );
} 