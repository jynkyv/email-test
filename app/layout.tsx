import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

export const metadata: Metadata = {
  title: '邮件管理系统',
  description: '基于Gmail API的邮件管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ConfigProvider 
          locale={zhCN}
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorBgContainer: '#ffffff',
              colorBgLayout: '#f5f5f5',
              colorPrimary: '#1890ff',
              colorBgBase: '#ffffff',
              colorBgElevated: '#ffffff',
            },
          }}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
