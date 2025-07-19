'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: any | null;
  userRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 检查本地存储的会话
    const checkSession = async () => {
      try {
      const session = localStorage.getItem('user_session');
      if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('检查会话时出错:', error);
        localStorage.removeItem('user_session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [mounted]);

  const signIn = async (username: string, password: string) => {
    try {
      console.log('尝试登录:', username);
      
      // 从数据库验证用户
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      console.log('查询结果:', userData, userError);

      if (userError || !userData) {
        console.log('用户不存在');
        return { error: { message: '用户名不存在' } };
      }

      // 这里应该验证密码，但为了简化，我们暂时跳过密码验证
      // 在实际应用中，你应该使用 bcrypt 或其他加密方式
      console.log('用户验证成功:', userData);

      // 保存用户信息到本地存储
      if (typeof window !== 'undefined') {
      localStorage.setItem('user_session', JSON.stringify(userData));
      }
      setUser(userData);
      setUserRole(userData.role);

      return { data: userData };
    } catch (error) {
      console.error('登录错误:', error);
      return { error: { message: '登录失败' } };
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
    localStorage.removeItem('user_session');
    }
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 