import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import DynamicConfigProvider from './components/DynamicConfigProvider';

export const metadata: Metadata = {
  title: '邮件管理系统',
  description: '邮件管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="font-sans">
        <I18nProvider>
          <AuthProvider>
            <DynamicConfigProvider>
              {children}
            </DynamicConfigProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
