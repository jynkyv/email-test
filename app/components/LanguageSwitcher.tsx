'use client';

import { Button, Dropdown } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useI18n } from '@/contexts/I18nContext';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const items = [
    {
      key: 'zh',
      label: (
        <div className="flex items-center space-x-3 py-2">
          <span className="text-xl">🇨🇳</span>
          <div className="flex flex-col">
            <span className="font-medium">中文</span>
            <span className="text-xs text-gray-500">Chinese</span>
          </div>
        </div>
      ),
      onClick: () => setLocale('zh'),
    },
    {
      key: 'ja',
      label: (
        <div className="flex items-center space-x-3 py-2">
          <span className="text-xl">🇯🇵</span>
          <div className="flex flex-col">
            <span className="font-medium">日本語</span>
            <span className="text-xs text-gray-500">Japanese</span>
          </div>
        </div>
      ),
      onClick: () => setLocale('ja'),
    },
  ];

  const getCurrentLanguageDisplay = () => {
    if (locale === 'zh') {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg">🇨🇳</span>
          <span className="hidden sm:inline font-medium">中文</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg">🇯🇵</span>
          <span className="hidden sm:inline font-medium">日本語</span>
        </div>
      );
    }
  };

  return (
    <Dropdown
      menu={{ 
        items,
        style: {
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1px solid #f0f0f0',
          padding: '8px',
          minWidth: '160px',
        }
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        className="flex items-center px-4 py-2 h-auto border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all duration-300"
        style={{
          minWidth: 'auto',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {getCurrentLanguageDisplay()}
        <div className="flex items-center ml-2">
          <GlobalOutlined className="text-gray-400 mr-1" />
          <DownOutlined className="text-xs text-gray-400" />
        </div>
      </Button>
    </Dropdown>
  );
} 