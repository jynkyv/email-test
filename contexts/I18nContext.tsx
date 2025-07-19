'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';

type Locale = 'zh' | 'ja';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const locales = {
  zh,
  ja,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh');

  useEffect(() => {
    // 从 localStorage 获取保存的语言设置
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'ja')) {
      setLocale(savedLocale);
    }
  }, []);

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = locales[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 如果找不到翻译，返回原键
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }

    return value;
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
} 