'use client';

import React, { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提取实际的 Provider 逻辑到内部组件
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const setupAuth = async () => {
      setLoading(true);
      try {
        const accountParam = searchParams.get('account');

        if (accountParam) {
          console.log(`Authenticating via query param: ${accountParam}`);
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', accountParam)
            .single();

          if (!error && userData) {
            setUser(userData);
            setUserRole(userData.role);
            localStorage.setItem('user_session', JSON.stringify(userData));
          } else {
            console.error('User not found for account param:', accountParam);
            setUser(null);
            setUserRole(null);
            localStorage.removeItem('user_session');
          }
        } else {
          const session = localStorage.getItem('user_session');
          if (session) {
            const userData = JSON.parse(session);
            setUser(userData);
            setUserRole(userData.role);
          } else {
            setUser(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error during authentication setup:', error);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();
  }, [mounted, searchParams]);

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 导出的外层包装器，使用 Suspense 捕获 searchParams
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </Suspense>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 