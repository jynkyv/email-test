'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Button, message } from 'antd';
import { 
  MailOutlined, 
  UserOutlined, 
  TeamOutlined, 
  LogoutOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import LanguageSwitcher from './LanguageSwitcher';

const { Header } = Layout;

interface HeaderProps {
  children?: React.ReactNode;
}

export default function AppHeader({ children }: HeaderProps) {
  const { user, userRole, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut();
    message.success(t('auth.logoutSuccess'));
    router.push('/login');
  };

  const getActiveKey = () => {
    if (pathname === '/') return 'email';
    if (pathname === '/customers') return 'customers';
    if (pathname === '/approvals') return 'approvals';
    if (pathname === '/users') return 'users';
    return 'email';
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'email':
        router.push('/');
        break;
      case 'customers':
        router.push('/customers');
        break;
      case 'approvals':
        router.push('/approvals');
        break;
      case 'users':
        router.push('/users');
        break;
    }
  };

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

  return (
    <Header className="bg-white shadow-sm border-b flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 mr-8">{t('navigation.emailSystem')}</h1>
        <Menu
          mode="horizontal"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none bg-transparent"
        />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {user?.username} ({userRole === 'admin' ? t('auth.admin') : t('auth.employee')})
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
  );
}

