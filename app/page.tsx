'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Button, Spin, message } from 'antd';
import { 
  MailOutlined, 
  UserOutlined, 
  TeamOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';
import CustomerManager from './components/CustomerManager';
import UserManager from './components/UserManager';

const { Header, Content } = Layout;

interface ReplyData {
  to: string;
  subject: string;
  content: string;
}

export default function Home() {
  const [replyData, setReplyData] = useState<ReplyData | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const { user, userRole, loading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log('用户未登录，重定向到登录页面');
      router.push('/login');
    }
  }, [mounted, loading, user, router]);

  const handleReply = (emailData: ReplyData) => {
    setReplyData(emailData);
  };

  const handleSendComplete = () => {
    setReplyData(null);
  };

  const handleSignOut = () => {
    signOut();
    message.success('已退出登录');
    router.push('/login');
  };

  // 在客户端挂载之前，显示加载状态
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">正在检查认证状态...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示重定向信息
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin />
          <p className="text-gray-600 mt-4">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'email',
      icon: <MailOutlined />,
      label: '邮件管理',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: '客户管理',
    },
    ...(userRole === 'admin' ? [{
      key: 'users',
      icon: <TeamOutlined />,
      label: '用户管理',
    }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'email':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 h-[850px]">
              <EmailSender 
                replyData={replyData}
                onSendComplete={handleSendComplete}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 h-[850px]">
              <EmailViewer onReply={handleReply} />
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="max-w-4xl mx-auto">
            <CustomerManager />
          </div>
        );
      case 'users':
        return (
          <div className="max-w-4xl mx-auto">
            <UserManager />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="bg-white shadow-sm border-b flex items-center justify-between px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800 mr-8">邮件管理系统</h1>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key)}
            className="border-none bg-transparent"
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user.username} ({userRole === 'admin' ? '管理员' : '员工'})
          </span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-800"
          >
            退出登录
          </Button>
        </div>
      </Header>

      <Content className="p-6">
        {renderContent()}
      </Content>
    </Layout>
  );
}
