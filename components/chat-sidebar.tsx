'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, collection, query, where, orderBy, onSnapshot, Timestamp, handleFirestoreError, OperationType } from '@/firebase';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  userId: string;
  createdAt: string;
}

export default function ChatSidebar({
  currentConversationId,
  onNewChat,
}: {
  currentConversationId: string | null;
  onNewChat: () => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const path = 'conversations';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Conversation;
      });
      setConversations(convs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <aside className="w-64 bg-muted border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground px-2 py-4">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4">No conversations yet</p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => router.push(`/chat?id=${conversation.id}`)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-primary/20 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <div className="truncate">Conversation</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(conversation.createdAt)}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Button>
      </div>
    </aside>
  );
}
