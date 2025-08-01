import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '配信管理 - メール配信停止・再購読',
  description: 'メール配信の停止・再購読を管理できます。簡単に配信設定を変更いただけます。',
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 