'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleUnsubscribe(emailParam);
    } else {
      setStatus('error');
      setMessage('缺少邮箱参数');
    }
  }, [searchParams]);

  const handleUnsubscribe = async (emailAddress: string) => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailAddress,
          reason: '通过邮件链接退订'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        if (data.alreadyUnsubscribed) {
          setMessage('该邮箱已经退订');
        } else {
          setMessage('退订成功');
        }
      } else {
        setStatus('error');
        setMessage(data.message || '退订失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('退订处理失败');
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;
    
    try {
      const response = await fetch('/api/resubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('重新订阅成功');
      } else {
        setStatus('error');
        setMessage(data.message || '重新订阅失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('重新订阅处理失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && '处理中...'}
            {status === 'success' && '退订成功'}
            {status === 'error' && '处理失败'}
          </h2>
          
          {email && (
            <p className="mt-2 text-sm text-gray-600">
              邮箱地址: {email}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">正在处理您的退订请求...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {message}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  您将不再收到我们的邮件。如果您改变主意，可以随时重新订阅。
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleResubscribe}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    重新订阅
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  处理失败
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    重试
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            如有问题，请联系我们的客服团队
          </p>
        </div>
      </div>
    </div>
  );
} 