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
import { PlusOutlined, UserOutlined, TeamOutlined, SendOutlined, MailOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
  email_send_count?: number;
  email_recipient_count?: number;
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
      console.error('获取员工列表失败:', error);
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

  const handleDeleteUser = async (userId: string, username: string) => {
    // 防止删除自己
    if (userId === user?.id) {
      message.error(t('user.cannotDeleteSelf'));
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        message.success(t('user.userDeleted'));
        fetchUsers();
      } else {
        message.error(data.error || t('user.userDeleteFailed'));
      }
    } catch (error) {
      console.error('删除员工失败:', error);
      message.error(t('user.userDeleteFailed'));
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
      title: t('user.username'),
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
      title: t('user.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? t('auth.admin') : t('auth.employee')}
        </Tag>
      ),
    },
    {
      title: t('user.emailSendCount'),
      dataIndex: 'email_send_count',
      key: 'email_send_count',
      render: (count: number) => (
        <Space>
          <SendOutlined style={{ color: '#1890ff' }} />
          <span className="font-medium">{count || 0}</span>
        </Space>
      ),
    },
    {
      title: t('user.emailRecipientCount'),
      dataIndex: 'email_recipient_count',
      key: 'email_recipient_count',
      render: (count: number) => (
        <Space>
          <MailOutlined style={{ color: '#52c41a' }} />
          <span className="font-medium">{count || 0}</span>
        </Space>
      ),
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
      render: (_: any, record: User) => (
        <Space>
          {userRole === 'admin' && record.id !== user?.id && (
            <Tooltip title={t('user.deleteUser')}>
              <Popconfirm
                title={t('user.deleteConfirmTitle')}
                description={t('user.deleteConfirmDescription', { name: record.username })}
                onConfirm={() => handleDeleteUser(record.id, record.username)}
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

  // 如果不是管理员，显示权限不足信息
  if (userRole !== 'admin') {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <TeamOutlined className="text-4xl mb-4" />
          <p className="text-lg">{t('user.insufficientPermissions')}</p>
          <p className="text-sm mt-2">{t('user.onlyAdminCanManageUsers')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={t('navigation.userManagement')} className="shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-xl" />
            <span className="text-lg font-medium">{t('user.userList')}</span>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            size="large"
          >
            {t('user.createUser')}
          </Button>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('common.totalRecords', { total }),
          }}
          locale={{
            emptyText: t('user.noUsers'),
          }}
        />
      </Card>

      {/* 创建员工 Modal */}
      <Modal
        title={t('user.createUser')}
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
            name="username"
            label={t('user.username')}
            rules={[{ required: true, message: t('user.usernameRequired') }]}
          >
            <Input 
              placeholder={t('user.username')}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={t('user.password')}
            rules={[{ required: true, message: t('user.passwordRequired') }]}
          >
            <Input.Password 
              placeholder={t('user.password')}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="role"
            label={t('user.role')}
            rules={[{ required: true, message: t('user.roleRequired') }]}
          >
            <Select 
              placeholder={t('user.role')}
              size="large"
            >
              <Option value="employee">{t('auth.employee')}</Option>
              <Option value="admin">{t('auth.admin')}</Option>
            </Select>
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
                {t('user.createUser')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}