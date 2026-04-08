'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged, db, collection, addDoc, serverTimestamp } from '@/firebase';
import ChatInterface from '@/components/chat-interface';
import ChatSidebar from '@/components/chat-sidebar';

export default function ChatPageContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const id = searchParams.get('id');
    if (id) {
      setConversationId(id);
    }
  }, [searchParams, isMounted]);

  const handleNewChat = async () => {
    if (!user) return;
    
    try {
      const docRef = await addDoc(collection(db, 'conversations'), {
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      if (docRef.id) {
        router.push(`/chat?id=${docRef.id}`);
        setConversationId(docRef.id);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="h-screen flex bg-background">
      <ChatSidebar currentConversationId={conversationId} onNewChat={handleNewChat} />
      <div className="flex-1 flex flex-col">
        {conversationId && user ? (
          <ChatInterface userId={user?.uid} conversationId={conversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">No conversation selected</h2>
              <p className="text-muted-foreground mb-6">Start a new chat to begin</p>
              <button
                onClick={handleNewChat}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
