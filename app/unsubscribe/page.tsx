'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
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
      setMessage('メールアドレスパラメータが不足しています');
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
          reason: 'メールリンクから配信停止'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        if (data.alreadyUnsubscribed) {
          setMessage('このメールアドレスは既に配信停止されています');
        } else {
          setMessage('配信停止が完了しました');
        }
      } else {
        setStatus('error');
        setMessage(data.message || '配信停止に失敗しました');
      }
    } catch (error) {
      setStatus('error');
      setMessage('配信停止の処理に失敗しました');
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
        setMessage('再購読が完了しました');
      } else {
        setStatus('error');
        setMessage(data.message || '再購読に失敗しました');
      }
    } catch (error) {
      setStatus('error');
      setMessage('再購読の処理に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && '処理中...'}
            {status === 'success' && '配信停止完了'}
            {status === 'error' && '処理失敗'}
          </h2>
          
          {email && (
            <p className="mt-2 text-sm text-gray-600">
              メールアドレス: {email}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">配信停止リクエストを処理中...</p>
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
                  今後、当社からのメールは配信されません。ご希望がございましたら、いつでも再購読いただけます。
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleResubscribe}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    再購読する
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
                  処理失敗
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {message}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            ご不明な点がございましたら、カスタマーサポートまでお問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
}

// ローディング状態コンポーネント
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    </div>
  );
}

// メインコンポーネント、Suspenseでラップ
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
} 