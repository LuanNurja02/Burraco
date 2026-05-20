'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { MatchResult } from '@/types';
import { calculateVictoryPoints, calculateMatchPoints } from '@/lib/scoring';
import { v4 as uuidv4 } from 'uuid';
import { exportTournamentToPDF, exportTournamentToCSV } from '@/lib/export';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = typeof params.id === 'string' ? params.id : '';
  const { tournaments, players, updateTournament, addTournamentRound } = useStore();
  const [showAddRound, setShowAddRound] = useState(false);
  const [roundTables, setRoundTables] = useState<{ homeId: string; awayId: string; homeScore: number; awayScore: number }[]>([]);

  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Torneo non trovato</p>
        <Link href="/tournaments" className="btn-primary">
          ← Torna ai Tornei
        </Link>
      </div>
    );
  }

  const tournamentPlayers = players.filter((p) => tournament.playerIds.includes(p.id));

  const formatLabels: Record<string, string> = { pairs: 'Coppie', singles: 'Singolare', teams: 'Squadre' };
  const movementLabels: Record<string, string> = { mitchell: 'Mitchell', danese: 'Danese', american: 'Americano' };

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name ?? '???';
  const getPlayerColor = (id: string) => players.find((p) => p.id === id)?.color ?? '#9ca3af';

  const handleRemovePlayer = (playerId: string) => {
    updateTournament(tournament.id, {
      playerIds: tournament.playerIds.filter((id) => id !== playerId),
    });
  };

  const initRoundTables = () => {
    const pts = tournamentPlayers;
    const tables: typeof roundTables = [];
    for (let i = 0; i < Math.floor(pts.length / 2); i++) {
      tables.push({
        homeId: pts[i * 2]?.id ?? '',
        awayId: pts[i * 2 + 1]?.id ?? '',
        homeScore: 0,
        awayScore: 0,
      });
    }
    setRoundTables(tables);
    setShowAddRound(true);
  };

  const handleSaveRound = () => {
    const results: MatchResult[] = roundTables.map((table, i) => {
      const vp = calculateVictoryPoints(table.homeScore, table.awayScore, tournament.targetScore);
      return {
        tableNumber: i + 1,
        homeTeam: getPlayerName(table.homeId),
        awayTeam: getPlayerName(table.awayId),
        homeScore: table.homeScore,
        awayScore: table.awayScore,
        homeVP: vp.homeVP,
        awayVP: vp.awayVP,
      };
    });

    const roundNumber = tournament.tournamentRounds.length + 1;
    addTournamentRound(tournament.id, {
      number: roundNumber,
      tables: results,
      completed: true,
    });

    setShowAddRound(false);
    setRoundTables([]);
  };

  const handleStartTournament = () => {
    if (tournamentPlayers.length < 2) return;
    updateTournament(tournament.id, { status: 'active' });
  };

  const handleFinishTournament = () => {
    updateTournament(tournament.id, { status: 'finished' });
  };

  const sortedPlayers = tournamentPlayers.map((player) => {
    let totalVP = 0;
    let totalMP = 0;
    let totalPoints = 0;

    for (const round of tournament.tournamentRounds) {
      for (const table of round.tables) {
        if (table.homeTeam === player.name) {
          totalVP += table.homeVP;
          totalMP += table.homeScore > table.awayScore ? 2 : table.homeScore === table.awayScore ? 1 : 0;
          totalPoints += table.homeScore;
        }
        if (table.awayTeam === player.name) {
          totalVP += table.awayVP;
          totalMP += table.awayScore > table.homeScore ? 2 : table.awayScore === table.homeScore ? 1 : 0;
          totalPoints += table.awayScore;
        }
      }
    }

    return { ...player, totalVP, totalMP, totalPoints };
  }).sort((a, b) => {
    if (b.totalVP !== a.totalVP) return b.totalVP - a.totalVP;
    if (b.totalMP !== a.totalMP) return b.totalMP - a.totalMP;
    return b.totalPoints - a.totalPoints;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/tournaments" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
            ← Torna ai Tornei
          </Link>
          <h1 className="text-3xl font-bold mt-1">{tournament.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {formatLabels[tournament.format]}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {movementLabels[tournament.movement]}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {tournament.numRounds} smazzate
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tournament.status === 'pending' && tournamentPlayers.length >= 2 && (
            <button onClick={handleStartTournament} className="btn-primary">
              ▶ Avvia Torneo
            </button>
          )}
          {tournament.status === 'active' && (
            <button onClick={handleFinishTournament} className="btn-secondary">
              🏁 Concludi Torneo
            </button>
          )}
          {tournament.tournamentRounds.length > 0 && (
            <>
              <button onClick={() => exportTournamentToPDF(tournament, players)} className="btn-secondary">
                📄 PDF
              </button>
              <button onClick={() => exportTournamentToCSV(tournament, players)} className="btn-secondary">
                📊 CSV
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Partecipanti ({tournamentPlayers.length})</h2>
        </div>

        {tournamentPlayers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Seleziona i giocatori quando crei il torneo
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tournamentPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-medium">{player.name}</span>
                {tournament.status === 'pending' && (
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-400 hover:text-red-600 ml-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {tournament.status !== 'pending' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Smazzate Giocate ({tournament.tournamentRounds.length}/{tournament.numRounds})</h2>
            {tournament.status === 'active' && tournament.tournamentRounds.length < tournament.numRounds && (
              <button onClick={initRoundTables} className="btn-primary text-sm">
                + Nuova Smazzata
              </button>
            )}
          </div>

          {tournament.tournamentRounds.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nessuna smazzata giocata</p>
          ) : (
            <div className="space-y-3">
              {tournament.tournamentRounds.map((round) => (
                <div key={round.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-sm mb-2 text-gray-500 dark:text-gray-400">Smazzata {round.number}</h3>
                  <div className="space-y-1">
                    {round.tables.map((table) => (
                      <div key={table.tableNumber} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded text-sm">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-xs text-gray-400 w-14">Tavolo {table.tableNumber}</span>
                          <span className="font-medium flex-1">{table.homeTeam}</span>
                          <span className={`font-bold text-lg px-2 ${table.homeScore > table.awayScore ? 'text-green-600' : ''}`}>
                            {table.homeScore}
                          </span>
                          <span className="text-gray-400">-</span>
                          <span className={`font-bold text-lg px-2 ${table.awayScore > table.homeScore ? 'text-green-600' : ''}`}>
                            {table.awayScore}
                          </span>
                          <span className="font-medium flex-1 text-right">{table.awayTeam}</span>
                        </div>
                        <span className="ml-3 text-xs text-gray-400">VP {table.homeVP}-{table.awayVP}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sortedPlayers.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">🏆 Classifica</h2>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
                  index === 1 ? 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600' :
                  index === 2 ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' :
                  'bg-gray-50 dark:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: player.color ?? '#9ca3af' }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{player.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">VP: <span className="font-bold text-gray-700 dark:text-gray-300">{player.totalVP}</span></span>
                  <span className="text-gray-500 dark:text-gray-400">MP: <span className="font-bold text-gray-700 dark:text-gray-300">{player.totalMP}</span></span>
                  <span className="text-gray-500 dark:text-gray-400">Pts: <span className="font-bold text-primary-600">{player.totalPoints}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddRound && (
        <div className="card space-y-4 border-2 border-primary-200 dark:border-primary-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">📝 Smazzata {tournament.tournamentRounds.length + 1}</h2>
            <button onClick={() => { setShowAddRound(false); setRoundTables([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">
              ✕
            </button>
          </div>

          {roundTables.map((table, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Tavolo {i + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: getPlayerColor(table.homeId) }} />
                    {getPlayerName(table.homeId)}
                  </label>
                  <input
                    type="number"
                    value={table.homeScore || ''}
                    onChange={(e) => {
                      const newTables = [...roundTables];
                      newTables[i]!.homeScore = parseInt(e.target.value) || 0;
                      setRoundTables(newTables);
                    }}
                    className="input"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: getPlayerColor(table.awayId) }} />
                    {getPlayerName(table.awayId)}
                  </label>
                  <input
                    type="number"
                    value={table.awayScore || ''}
                    onChange={(e) => {
                      const newTables = [...roundTables];
                      newTables[i]!.awayScore = parseInt(e.target.value) || 0;
                      setRoundTables(newTables);
                    }}
                    className="input"
                    min={0}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSaveRound} className="btn-primary">
              ✓ Salva Smazzata
            </button>
            <button onClick={() => { setShowAddRound(false); setRoundTables([]); }} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
