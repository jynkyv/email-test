'use client';

import EmailSender from './components/EmailSender';
import EmailViewer from './components/EmailViewer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <EmailSender />
          </div>
          
          <div>
            <EmailViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
