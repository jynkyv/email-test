'use client';

import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import jaJP from 'antd/locale/ja_JP';
import { useI18n } from '@/contexts/I18nContext';

export default function DynamicConfigProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { locale } = useI18n();
  
  return (
    <ConfigProvider locale={locale === 'ja' ? jaJP : zhCN}>
      {children}
    </ConfigProvider>
  );
} 