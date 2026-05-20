'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { GameMode, GameType } from '@/types';
import { getCumulativeScore } from '@/lib/scoring';

export default function GamesPage() {
  const { games, players, createGame, deleteGame } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<GameMode>('2v2');
  const [type, setType] = useState<GameType>('2005');
  const [customTarget, setCustomTarget] = useState(2005);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [teamPlayerIds, setTeamPlayerIds] = useState<string[][]>([[], []]);

  const teamCount = mode === '1v1v1' ? 3 : 2;
  const playersPerTeam = mode === '1v1' ? 1 : mode === '2v2' ? 2 : 1;

  const usedIds = useMemo(() => new Set(teamPlayerIds.flat()), [teamPlayerIds]);

  const availablePlayers = useMemo(() => {
    return players.filter((p) => !usedIds.has(p.id));
  }, [players, usedIds]);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    const count = newMode === '1v1v1' ? 3 : 2;
    setTeamPlayerIds(Array.from({ length: count }, () => []));
  };

  const assignPlayer = (teamIndex: number, playerId: string) => {
    setTeamPlayerIds((prev) => {
      const wasInThisTeam = prev[teamIndex]?.includes(playerId) ?? false;
      const newIds = prev.map((ids) => [...ids]);

      for (let i = 0; i < newIds.length; i++) {
        newIds[i] = newIds[i].filter((id) => id !== playerId);
      }

      if (!wasInThisTeam && newIds[teamIndex]!.length < playersPerTeam) {
        newIds[teamIndex]!.push(playerId);
      }

      return newIds;
    });
  };

  const removePlayerFromTeam = (teamIndex: number, playerId: string) => {
    setTeamPlayerIds((prev) =>
      prev.map((ids, i) => (i === teamIndex ? ids.filter((id) => id !== playerId) : ids))
    );
  };

  const isFormValid = useMemo(() => {
    return teamPlayerIds.every((ids) => ids.length === playersPerTeam);
  }, [teamPlayerIds, playersPerTeam]);

  const handleCreateGame = () => {
    if (!isFormValid) return;

    const teams = teamPlayerIds.map((ids, i) => {
      const playerNames = ids.map((id) => players.find((p) => p.id === id)?.name ?? '').filter(Boolean);
      return {
        name: playerNames.join(' & ') || `Team ${i + 1}`,
        playerIds: ids,
      };
    });

    createGame(mode, type, teams);
    setShowForm(false);
    setTeamPlayerIds(Array.from({ length: teamCount }, () => []));
  };

  const handleDelete = (gameId: string) => {
    if (deleteConfirm === gameId) {
      deleteGame(gameId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(gameId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name ?? '???';
  const getPlayerColor = (id: string) => players.find((p) => p.id === id)?.color ?? '#9ca3af';

  const teamLabels = mode === '2v2' ? ['Coppia 1', 'Coppia 2', 'Coppia 3'] : ['Giocatore 1', 'Giocatore 2', 'Giocatore 3'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Partite</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Annulla' : '+ Nuova Partita'}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-5">
          <h2 className="text-xl font-bold">Crea Nuova Partita</h2>

          {players.length < 2 ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                Servono almeno 2 giocatori
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm mb-3">
                Aggiungi giocatori dalla sezione Giocatori per poter creare partite
              </p>
              <Link href="/players" className="btn-primary">
                Vai ai Giocatori
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Modalità di gioco</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: '1v1' as GameMode, label: '1 vs 1', desc: '2 giocatori' },
                    { value: '2v2' as GameMode, label: '2 vs 2', desc: '4 giocatori (coppie)' },
                    { value: '1v1v1' as GameMode, label: '1 vs 1 vs 1', desc: '3 giocatori' },
                  ]).map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleModeChange(m.value)}
                      className={`p-3 rounded-lg border-2 transition-colors text-center ${
                        mode === m.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Punteggio obiettivo</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: '1005' as GameType, label: '1005' },
                    { value: '2005' as GameType, label: '2005' },
                    { value: '2505' as GameType, label: '2505' },
                    { value: 'custom' as GameType, label: 'Personalizzato' },
                  ]).map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`p-3 rounded-lg border-2 transition-colors text-center ${
                        type === t.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {type === 'custom' && (
                  <input
                    type="number"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(parseInt(e.target.value) || 2005)}
                    className="input mt-2"
                    placeholder="Punteggio obiettivo"
                    min={500}
                    step={5}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Componi le squadre — clicca i numeri per assegnare i giocatori
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {Array.from({ length: teamCount }).map((_, teamIndex) => {
                    const ids = teamPlayerIds[teamIndex] ?? [];
                    const isFull = ids.length === playersPerTeam;
                    return (
                      <div
                        key={teamIndex}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          isFull
                            ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-sm">{teamLabels[teamIndex]}</span>
                          <span className={`text-xs font-medium ${isFull ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {ids.length}/{playersPerTeam}
                          </span>
                        </div>

                        <div className="space-y-1 min-h-[2rem]">
                          {ids.map((pid) => (
                            <div
                              key={pid}
                              className="flex items-center justify-between px-2 py-1.5 bg-white dark:bg-gray-700 rounded text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getPlayerColor(pid) }}
                                />
                                <span className="font-medium">{getPlayerName(pid)}</span>
                              </div>
                              <button
                                onClick={() => removePlayerFromTeam(teamIndex, pid)}
                                className="text-red-400 hover:text-red-600 text-xs font-bold px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {ids.length === 0 && (
                            <p className="text-xs text-gray-400 italic py-1">Vuoto</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
                    Giocatori disponibili — clicca il numero della squadra:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availablePlayers.map((player) => (
                      <div key={player.id} className="flex items-center">
                        <div
                          className="flex items-center space-x-2 px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="font-medium">{player.name}</span>
                        </div>
                        {Array.from({ length: teamCount }).map((_, ti) => {
                          const isAssigned = usedIds.has(player.id);
                          const isAssignedToThis = teamPlayerIds[ti]?.includes(player.id);
                          return (
                            <button
                              key={ti}
                              onClick={() => assignPlayer(ti, player.id)}
                              className={`w-8 h-10 text-sm font-bold border transition-all ${
                                isAssignedToThis
                                  ? 'bg-primary-600 border-primary-600 text-white'
                                  : isAssigned
                                    ? 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500 text-gray-400 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 hover:border-primary-400'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-primary-600 hover:border-primary-600 hover:text-white'
                              } ${ti === teamCount - 1 ? 'rounded-r-lg' : ''}`}
                              title={isAssignedToThis ? `Rimuovi da ${teamLabels[ti]}` : `Assegna a ${teamLabels[ti]}`}
                            >
                              {ti + 1}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                    {availablePlayers.length === 0 && usedIds.size > 0 && (
                      <p className="text-xs text-gray-400 italic py-2">Tutti i giocatori sono stati assegnati</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleCreateGame}
                  disabled={!isFormValid}
                  className="btn-primary text-base px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crea Partita
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">
                  Annulla
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        {games.length === 0 && !showForm && (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🃏</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nessuna partita. Creane una nuova!</p>
          </div>
        )}

        {games.map((game) => {
          const teamScores = game.teams.map((team) => ({
            name: team.name,
            score: getCumulativeScore(game, team.id),
            playerIds: team.playerIds,
          }));

          return (
            <div key={game.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold">{game.mode}</h3>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{game.type} (target: {game.targetScore})</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Smazzata {game.currentHand} | Mazziere: {game.teams.find((t) => t.id === game.currentDealer)?.name ?? '-'}
                  </p>
                  <div className="space-y-3">
                    {teamScores.map((ts, i) => {
                      const progress = Math.min((ts.score / game.targetScore) * 100, 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{ts.name}</span>
                              <div className="flex space-x-1">
                                {ts.playerIds.map((pid) => (
                                  <div
                                    key={pid}
                                    className="w-3 h-3 rounded-full ring-1 ring-gray-300 dark:ring-gray-600"
                                    style={{ backgroundColor: getPlayerColor(pid) }}
                                    title={getPlayerName(pid)}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="font-bold">{ts.score} / {game.targetScore}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                ts.score >= game.targetScore ? 'bg-green-500' : 'bg-primary-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : game.status === 'paused'
                          ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {game.status === 'active' ? 'In corso' : game.status === 'paused' ? 'In pausa' : 'Conclusa'}
                  </span>
                  {game.winner && (
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      {game.winner}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/games/${game.id}`} className="btn-primary">
                  {game.status === 'active' ? 'Continua' : game.status === 'paused' ? 'Riprendi' : 'Visualizza'}
                </Link>
                {deleteConfirm === game.id ? (
                  <button onClick={() => handleDelete(game.id)} className="btn-danger">
                    Conferma eliminazione
                  </button>
                ) : (
                  <button onClick={() => handleDelete(game.id)} className="btn-secondary text-red-600 hover:text-red-700">
                    Elimina
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
