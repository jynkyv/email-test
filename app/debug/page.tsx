'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      setError('获取用户失败');
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          role: 'admin',
        });

      if (error) {
        setError(error.message);
      } else {
        setError('测试用户创建成功');
        fetchUsers();
      }
    } catch (err) {
      setError('创建测试用户失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">调试页面</h1>
        
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">数据库中的用户</h2>
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          
          <button
            onClick={createTestUser}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            创建测试用户 (admin)
          </button>
          
          {users.length === 0 ? (
            <p className="text-gray-500">暂无用户</p>
          ) : (
            <div className="space-y-2">
              {users.map((user: any) => (
                <div key={user.id} className="border p-3 rounded">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>用户名:</strong> {user.username}</p>
                  <p><strong>角色:</strong> {user.role}</p>
                  <p><strong>创建时间:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 