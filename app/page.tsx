'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Button, Spin, message } from 'antd';
import { 
  MailOutlined, 
  UserOutlined, 
  TeamOutlined, 
  LogoutOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';
import CustomerManager from './components/CustomerManager';
import UserManager from './components/UserManager';
import LanguageSwitcher from './components/LanguageSwitcher';
import ApprovalsPage from './approvals/page';

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
  const { t } = useI18n();
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

  // 当切换tab时，清空回复数据，重置表单
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 清空回复数据，这样EmailSender组件会重置表单
    setReplyData(null);
  };

  const handleSignOut = () => {
    signOut();
    message.success(t('auth.logoutSuccess'));
    router.push('/login');
  };

  // 在客户端挂载之前，显示加载状态
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 mt-4">{t('auth.checkingAuth')}</p>
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
          <p className="text-gray-600 mt-4">{t('auth.redirectingToLogin')}</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      key: 'email',
      icon: <MailOutlined />,
      label: t('navigation.emailManagement'),
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: t('navigation.customerManagement'),
    },
    {
      key: 'approvals',
      icon: <CheckCircleOutlined />,
      label: t('navigation.approvalManagement'),
    },
    ...(userRole === 'admin' ? [{
      key: 'users',
      icon: <TeamOutlined />,
      label: t('navigation.userManagement'),
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
          <div className="w-full px-6">
            <CustomerManager />
          </div>
        );
      case 'approvals':
        return (
          <div className="max-w-4xl mx-auto">
            <ApprovalsPage />
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
          <h1 className="text-xl font-bold text-gray-800 mr-8">{t('navigation.emailSystem')}</h1>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => handleTabChange(key)}
            className="border-none bg-transparent"
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user.username} ({userRole === 'admin' ? t('auth.admin') : t('auth.employee')})
          </span>
          <LanguageSwitcher />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-800"
          >
            {t('auth.logout')}
          </Button>
        </div>
      </Header>

      <Content className="p-6">
        {renderContent()}
      </Content>
    </Layout>
  );
}
