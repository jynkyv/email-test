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
  Select,
  Spin 
} from 'antd';
import { PlusOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';

const { Option } = Select;

interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { username: string; password: string; role: 'admin' | 'employee' }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('用户创建成功');
        form.resetFields();
        fetchUsers();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error('创建用户失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'} icon={role === 'admin' ? <CrownOutlined /> : <UserOutlined />}>
          {role === 'admin' ? '管理员' : '员工'}
        </Tag>
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
      <Card title="创建新用户" className="shadow-lg">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色!' }]}
            >
              <Select placeholder="请选择角色">
                <Option value="employee">员工</Option>
                <Option value="admin">管理员</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              创建用户
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="用户列表" className="shadow-lg">
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText: '暂无用户',
          }}
        />
      </Card>
    </div>
  );
}