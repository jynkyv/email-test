'use client';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  type?: 'fullscreen' | 'inline' | 'card';
  size?: 'small' | 'default' | 'large';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  type = 'fullscreen', 
  size = 'large', 
  text,
  className = ''
}: LoadingSpinnerProps) {
  const getSpinnerIcon = () => {
    const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
    return <LoadingOutlined style={{ fontSize: iconSize }} spin />;
  };

  const getSpinnerSize = () => {
    return size === 'small' ? 'small' : size === 'large' ? 'large' : 'default';
  };

  const renderContent = () => (
    <div className="text-center">
      <Spin 
        indicator={getSpinnerIcon()} 
        size={getSpinnerSize()}
      />
      {text && (
        <p className="text-gray-600 mt-4 text-sm">{text}</p>
      )}
    </div>
  );

  switch (type) {
    case 'fullscreen':
      return (
        <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
          {renderContent()}
        </div>
      );
    
    case 'card':
      return (
        <div className={`bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center ${className}`}>
          {renderContent()}
        </div>
      );
    
    case 'inline':
    default:
      return (
        <div className={`flex items-center justify-center ${className}`}>
          {renderContent()}
        </div>
      );
  }
}
