'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/firebase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    console.log("Home page mounted, checking auth state...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      if (user) {
        router.push('/chat');
      } else {
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground font-medium">Initializing Assistant...</p>
        <p className="text-xs text-muted-foreground">If this screen persists, please check the browser console for errors.</p>
      </div>
    </div>
  );
}
