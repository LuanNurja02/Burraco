'use client';

import Link from 'next/link';
import { useStore } from '@/store';

export default function SettingsPage() {
  const {
    darkMode,
    enableVoice,
    enableSound,
    toggleDarkMode,
    toggleVoice,
    toggleSound,
    games,
    players,
    tournaments,
  } = useStore();

  const totalGames = games.length;
  const finishedGames = games.filter((g) => g.status === 'finished').length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
          ← Home
        </Link>
        <h1 className="text-3xl font-bold">Impostazioni</h1>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-bold">🎨 Aspetto</h2>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium">Tema scuro</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Passa alla modalità notturna</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-bold">🔊 Audio e Voce</h2>

        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium">Annunci vocali</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Annuncia punteggi e vincitore a voce
            </p>
          </div>
          <button
            onClick={toggleVoice}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              enableVoice ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                enableVoice ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium">Effetti sonori</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Suono alla vittoria e alla fine smazzata
            </p>
          </div>
          <button
            onClick={toggleSound}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              enableSound ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                enableSound ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-bold">📊 Dati</h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{players.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Giocatori</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{totalGames}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Partite</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{tournaments.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tornei</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> Tutti i dati sono salvati nel browser (localStorage).
            Se cancelli i dati del browser, perderai tutte le partite e i giocatori.
          </p>
        </div>
      </div>

      <div className="card text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Burraco Manager v1.0
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Gestione professionale di partite e tornei di Burraco
        </p>
      </div>
    </div>
  );
}
