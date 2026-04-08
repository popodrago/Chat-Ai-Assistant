'use client';

import { useState, useEffect, useRef } from 'react';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, handleFirestoreError, OperationType } from '@/firebase';
import { Button } from '@/components/ui/button';
import MessageBubble from './message-bubble';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant. You provide clear, concise, and accurate responses to user queries. 
You are knowledgeable about a wide range of topics and you explain things in an easy to understand way.
You are honest about the limits of your knowledge and ask for clarification when needed.
You maintain a friendly and professional tone throughout the conversation.`;

export default function ChatInterface({
  userId,
  conversationId: initialConversationId,
}: {
  userId: string;
  conversationId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({ 
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' 
  });

  // Fetch conversation history in real-time
  useEffect(() => {
    if (!userId || !initialConversationId) return;

    const path = `conversations/${initialConversationId}/messages`;
    const messagesRef = collection(db, 'conversations', initialConversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          role: data.role,
          created_at: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Message;
      });
      setMessages(newMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [userId, initialConversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !initialConversationId || loading) return;

    const userMessage = input;
    const path = `conversations/${initialConversationId}/messages`;
    setInput('');
    setLoading(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, 'conversations', initialConversationId, 'messages'), {
        conversationId: initialConversationId,
        userId,
        content: userMessage,
        role: 'user',
        createdAt: serverTimestamp(),
      });

      // 2. Generate AI response using Gemini directly on the client
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        }
      });

      const aiResponse = response.text;

      if (aiResponse) {
        // 3. Save AI response to Firestore
        await addDoc(collection(db, 'conversations', initialConversationId, 'messages'), {
          conversationId: initialConversationId,
          userId,
          content: aiResponse,
          role: 'assistant',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">Your intelligent chat companion</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="mb-4 p-3 rounded-full bg-muted">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Start a conversation</h2>
              <p className="text-muted-foreground max-w-xs">Ask me anything and I'll do my best to help you</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message AI Assistant..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-muted text-foreground placeholder-muted-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-6 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
