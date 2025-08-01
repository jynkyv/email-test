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
  Select,
  Tag,
  Spin,
  Modal,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  UserOutlined, 
  TeamOutlined, 
  SendOutlined, 
  MailOutlined, 
  ReloadOutlined,
  UserAddOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
  email_send_count?: number;
  email_recipient_count?: number;
  fax_send_count?: number;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user, userRole } = useAuth();
  const { t } = useI18n();
  
  // Modal 相关状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        message.error(data.error || t('user.fetchUsersFailed'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error(t('user.fetchUsersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { username: string; password: string; role: string }) => {
    setModalLoading(true);
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
        message.success(t('user.userCreated'));
        form.resetFields();
        setIsModalVisible(false);
        fetchUsers();
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error(t('user.userCreateFailed'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span>{t('user.username')}</span>
        </div>
      ),
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-green-500" />
          <span>{t('user.role')}</span>
        </div>
      ),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'} icon={role === 'admin' ? <UserOutlined /> : <TeamOutlined />}>
          {role === 'admin' ? t('auth.admin') : t('auth.employee')}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <SendOutlined className="text-blue-500" />
          <span>{t('user.sendCount')}</span>
        </div>
      ),
      dataIndex: 'email_send_count',
      key: 'email_send_count',
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <SendOutlined className="text-blue-500" />
          <span className="text-blue-600 font-medium">
            {count || 0}
          </span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <MailOutlined className="text-green-500" />
          <span>{t('user.recipientCount')}</span>
        </div>
      ),
      dataIndex: 'email_recipient_count',
      key: 'email_recipient_count',
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <MailOutlined className="text-green-500" />
          <span className="text-green-600 font-medium">
            {count || 0}
          </span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-purple-500" />
          <span>{t('user.faxSendCount')}</span>
        </div>
      ),
      dataIndex: 'fax_send_count',
      key: 'fax_send_count',
      render: (count: number) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-purple-500" />
          <span className="text-purple-600 font-medium">
            {count || 0}
          </span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-500" />
          <span>{t('user.createdAt')}</span>
        </div>
      ),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400" />
          <span className="text-gray-500">
            {new Date(date).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-500 text-xl" />
            <span className="text-lg font-medium">{t('user.userManagement')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title={t('common.refresh')}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchUsers}
                loading={loading}
                type="text"
              />
            </Tooltip>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => setIsModalVisible(true)}
            >
              {t('user.createUser')}
            </Button>
          </div>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} / ${total} ${t('user.users')}`,
        }}
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined className="text-blue-500" />
            <span>{t('user.createUser')}</span>
          </div>
        }
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        confirmLoading={modalLoading}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-gray-500" />
                <span>{t('user.username')}</span>
              </div>
            }
            rules={[{ required: true, message: t('user.usernameRequired') }]}
          >
            <Input placeholder={t('user.usernamePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-gray-500" />
                <span>{t('user.password')}</span>
              </div>
            }
            rules={[{ required: true, message: t('user.passwordRequired') }]}
          >
            <Input.Password placeholder={t('user.passwordPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="role"
            label={
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-gray-500" />
                <span>{t('user.role')}</span>
              </div>
            }
            initialValue="employee"
          >
            <Select>
              <Option value="employee">{t('auth.employee')}</Option>
              <Option value="admin">{t('auth.admin')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}