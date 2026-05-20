'use client';

import Link from 'next/link';
import { useStore } from '@/store';
import { getCumulativeScore } from '@/lib/scoring';

export default function Home() {
  const { games, players, tournaments } = useStore();

  const activeGames = games.filter((g) => g.status === 'active');
  const finishedGames = games.filter((g) => g.status === 'finished');

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
          🃏 Burraco Manager
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Gestione professionale di partite e tornei di Burraco
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link href="/games" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Partite Attive</p>
              <p className="text-3xl font-bold text-primary-600">{activeGames.length}</p>
            </div>
            <div className="text-5xl">🎮</div>
          </div>
          <p className="mt-4 text-primary-600 dark:text-primary-400 font-medium">
            Gestisci partite →
          </p>
        </Link>

        <Link href="/players" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Giocatori</p>
              <p className="text-3xl font-bold text-blue-600">{players.length}</p>
            </div>
            <div className="text-5xl">👥</div>
          </div>
          <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
            Gestisci giocatori →
          </p>
        </Link>

        <Link href="/tournaments" className="card hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tornei</p>
              <p className="text-3xl font-bold text-purple-600">{tournaments.length}</p>
            </div>
            <div className="text-5xl">🏆</div>
          </div>
          <p className="mt-4 text-purple-600 dark:text-purple-400 font-medium">
            Gestisci tornei →
          </p>
        </Link>
      </div>

      {activeGames.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span>🟢</span>
            <span>Partite in Corso</span>
          </h2>
          <div className="space-y-3">
            {activeGames.map((game) => {
              const teamScores = game.teams.map((team) => ({
                name: team.name,
                score: getCumulativeScore(game, team.id),
              }));

              return (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{game.mode} - {game.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Smazzata {game.currentHand} | Mazziere: {game.teams.find((t) => t.id === game.currentDealer)?.name ?? '-'}
                      </p>
                      <div className="mt-2 flex space-x-4">
                        {teamScores.map((ts, i) => (
                          <span key={i} className="text-sm">
                            <span className="font-medium">{ts.name}:</span> {ts.score} pts
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      In corso
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {finishedGames.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span>📋</span>
            <span>Partite Concluse</span>
          </h2>
          <div className="space-y-3">
            {finishedGames.slice(-5).reverse().map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{game.mode} - {game.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      🏆 Vincitore: <span className="font-medium text-primary-600">{game.winner ?? '-'}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {game.hands.length} smazzate giocate
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
                    Conclusa
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🃏</div>
          <h2 className="text-2xl font-bold mb-2">Benvenuto in Burraco Manager</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Crea la tua prima partita per iniziare a tenere il punteggio
          </p>
          <Link href="/games" className="btn-primary text-lg px-8 py-3">
            Crea Partita
          </Link>
        </div>
      )}
    </div>
  );
}
