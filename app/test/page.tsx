'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 测试 Supabase 连接
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(`Supabase connection error: ${error.message}`);
        } else {
          setStatus('Supabase connection OK');
        }
      } catch (err) {
        setError(`Connection failed: ${err}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Connection Test
        </h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Supabase URL:</p>
            <p className="text-xs bg-gray-100 p-2 rounded">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Status:</p>
            <p className="text-sm">{status}</p>
          </div>
          
          {error && (
            <div>
              <p className="text-sm text-red-600">Error:</p>
              <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 