'use client';

import { useState } from 'react';
import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';

interface ReplyData {
  to: string;
  subject: string;
  content: string;
}

export default function Home() {
  const [replyData, setReplyData] = useState<ReplyData | null>(null);

  const handleReply = (emailData: ReplyData) => {
    setReplyData(emailData);
  };

  const handleSendComplete = () => {
    setReplyData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-none">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-[850px]">
            <EmailSender 
              replyData={replyData}
              onSendComplete={handleSendComplete}
            />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 h-[850px]">
            <EmailViewer onReply={handleReply} />
          </div>
        </div>
      </div>
    </div>
  );
}
