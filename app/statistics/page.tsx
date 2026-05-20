'use client';

import { useStore } from '@/store';
import { getCumulativeScore } from '@/lib/scoring';

export default function StatisticsPage() {
  const { players, games } = useStore();

  const totalGames = games.length;
  const activeGames = games.filter((g) => g.status === 'active').length;
  const finishedGames = games.filter((g) => g.status === 'finished').length;

  const sortedPlayers = [...players].sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
  const bestWinRate = [...players]
    .filter((p) => p.stats.gamesPlayed > 0)
    .sort((a, b) => (b.stats.gamesWon / b.stats.gamesPlayed) - (a.stats.gamesWon / a.stats.gamesPlayed))
    .slice(0, 5);
  const bestPlayers = [...players].sort((a, b) => b.stats.bestGame - a.stats.bestGame).slice(0, 5);

  const totalPointsAllGames = games.reduce((sum, game) => {
    for (const team of game.teams) {
      sum += getCumulativeScore(game, team.id);
    }
    return sum;
  }, 0);

  const totalTeamSlots = finishedGames > 0
    ? games.filter((g) => g.status === 'finished').reduce((sum, g) => sum + g.teams.length, 0)
    : 0;
  const avgPointsPerTeam = totalTeamSlots > 0 ? Math.round(totalPointsAllGames / totalTeamSlots) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistiche</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl mb-2">🎮</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Partite Totali</p>
          <p className="text-3xl font-bold text-primary-600">{totalGames}</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Corso</p>
          <p className="text-3xl font-bold text-blue-600">{activeGames}</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Concluse</p>
          <p className="text-3xl font-bold text-green-600">{finishedGames}</p>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Media Punti</p>
          <p className="text-3xl font-bold text-purple-600">{avgPointsPerTeam}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">🏅 Classifica Generale</h2>
        {sortedPlayers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nessun giocatore con statistiche</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="table-header text-center">#</th>
                  <th className="table-header">Giocatore</th>
                  <th className="table-header text-center">Partite</th>
                  <th className="table-header text-center">Vittorie</th>
                  <th className="table-header text-center">Vinte %</th>
                  <th className="table-header text-center">Punti Totali</th>
                  <th className="table-header text-center">Media</th>
                  <th className="table-header text-center">Record</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="table-cell text-center">
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-5 h-5 rounded-full ring-1 ring-gray-300 dark:ring-gray-600"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="font-semibold">{player.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-center">{player.stats.gamesPlayed}</td>
                    <td className="table-cell text-center font-semibold text-green-600">{player.stats.gamesWon}</td>
                    <td className="table-cell text-center">
                      {player.stats.gamesPlayed > 0
                        ? `${((player.stats.gamesWon / player.stats.gamesPlayed) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="table-cell text-center font-bold">{player.stats.totalPoints}</td>
                    <td className="table-cell text-center">{player.stats.gamesPlayed > 0 ? player.stats.averagePoints.toFixed(0) : '-'}</td>
                    <td className="table-cell text-center text-primary-600 font-semibold">{player.stats.bestGame > 0 ? player.stats.bestGame : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {bestWinRate.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">🎯 Miglior Percentuale Vittorie</h2>
          <div className="space-y-3">
            {bestWinRate.map((player, index) => {
              const winRate = (player.stats.gamesWon / player.stats.gamesPlayed) * 100;
              return (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-gray-400 w-8 text-center">{index + 1}</span>
                    <div
                      className="w-8 h-8 rounded-full ring-1 ring-gray-300 dark:ring-gray-600"
                      style={{ backgroundColor: player.color }}
                    />
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({player.stats.gamesWon}/{player.stats.gamesPlayed})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                    <span className="font-bold text-green-600 w-14 text-right">{winRate.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {bestPlayers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">⭐ Migliori Punti in una Partita</h2>
          <div className="space-y-3">
            {bestPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl font-bold text-gray-400 w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full ring-1 ring-gray-300 dark:ring-gray-600"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium">{player.name}</span>
                </div>
                <span className="text-xl font-bold text-primary-600">{player.stats.bestGame} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
