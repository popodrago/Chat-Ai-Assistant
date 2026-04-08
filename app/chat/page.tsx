'use client';

import { Suspense } from 'react';
import ChatPageContent from '@/components/chat-page-content';
import Loading from './loading';

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatPageContent />
    </Suspense>
  );
}
