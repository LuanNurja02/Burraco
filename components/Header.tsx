'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store';

export default function Header() {
  const pathname = usePathname();
  const { darkMode, enableVoice, enableSound, toggleDarkMode } = useStore();

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Partite', path: '/games', icon: '🎮' },
    { name: 'Giocatori', path: '/players', icon: '👥' },
    { name: 'Tornei', path: '/tournaments', icon: '🏆' },
    { name: 'Statistiche', path: '/statistics', icon: '📊' },
    { name: 'Impostazioni', path: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-2xl">🃏</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">Burraco Manager</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                  isActive(item.path)
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg"
              title="Impostazioni"
            >
              ⚙️
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <nav className="md:hidden flex overflow-x-auto py-2 -mx-4 px-4 space-x-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`whitespace-nowrap font-medium text-sm px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 ${
                isActive(item.path)
                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
