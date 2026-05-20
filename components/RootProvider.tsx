'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import Header from '@/components/Header';
import Disclaimer from '@/components/Disclaimer';

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { applyDarkMode, _hasHydrated, setHasHydrated } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    applyDarkMode();
    if (_hasHydrated) {
      setIsReady(true);
    }
  }, [applyDarkMode, _hasHydrated]);

  useEffect(() => {
    const checkStorage = () => {
      try {
        const raw = localStorage.getItem('burraco-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.state) {
            setHasHydrated(true);
            setIsReady(true);
            return;
          }
        }
      } catch {
      }
      setHasHydrated(true);
      setIsReady(true);
    };

    checkStorage();
  }, [setHasHydrated]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🃏</div>
          <p className="text-gray-500 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Disclaimer />
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </>
  );
}
