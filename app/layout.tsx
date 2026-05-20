import type { Metadata } from 'next';
import './globals.css';
import RootProvider from '@/components/RootProvider';

export const metadata: Metadata = {
  title: 'Burraco Manager - Gestione Professionale',
  description: 'App professionale per la gestione di partite e tornei di Burraco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
