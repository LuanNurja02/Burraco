'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';
import { Tournament } from '@/types';

export default function TournamentsPage() {
  const { tournaments, players, createTournament, deleteTournament } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<Tournament['format']>('pairs');
  const [movement, setMovement] = useState<Tournament['movement']>('mitchell');
  const [numRounds, setNumRounds] = useState(10);
  const [targetScore, setTargetScore] = useState(2005);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim() || selectedPlayerIds.length < 2) return;
    createTournament(name, format, movement, numRounds, targetScore, selectedPlayerIds);
    setName('');
    setSelectedPlayerIds([]);
    setShowForm(false);
  };

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPlayerIds.length === players.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(players.map((p) => p.id));
    }
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteTournament(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatLabels: Record<string, string> = { pairs: 'Coppie', singles: 'Singolare', teams: 'Squadre' };
  const movementLabels: Record<string, string> = { mitchell: 'Mitchell', danese: 'Danese', american: 'Americano' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tornei</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Annulla' : '+ Nuovo Torneo'}
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold">Crea Nuovo Torneo</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Nome Torneo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="es. Torneo di Burraco 2026"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pairs', 'singles', 'teams'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    format === f
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {formatLabels[f]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Movimento</label>
            <div className="grid grid-cols-3 gap-2">
              {(['mitchell', 'danese', 'american'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMovement(m)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    movement === m
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {movementLabels[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numero Smazzate</label>
              <input
                type="number"
                value={numRounds}
                onChange={(e) => setNumRounds(parseInt(e.target.value) || 10)}
                className="input"
                min={1}
                max={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Punteggio Target</label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 2005)}
                className="input"
                min={500}
                step={5}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Partecipanti ({selectedPlayerIds.length} selezionati)
              </label>
              {players.length > 0 && (
                <button onClick={selectAll} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  {selectedPlayerIds.length === players.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                </button>
              )}
            </div>

            {players.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ Aggiungi giocatori dalla sezione Giocatori prima di creare un torneo
                </p>
                <Link href="/players" className="btn-primary mt-2 text-sm inline-block">
                  Vai ai Giocatori →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                {players.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all text-sm text-left ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          isSelected ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="truncate font-medium">{player.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleCreate}
              disabled={selectedPlayerIds.length < 2}
              className="btn-primary"
            >
              Crea Torneo
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tournaments.length === 0 && !showForm && (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nessun torneo. Creane uno nuovo!</p>
          </div>
        )}

        {tournaments.map((tournament) => {
          const tournamentPlayers = players.filter((p) => tournament.playerIds.includes(p.id));

          return (
            <div key={tournament.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{tournament.name}</h3>
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
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      Target: {tournament.targetScore} pts
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tournamentPlayers.length} giocatori:
                    </span>
                    <div className="flex -space-x-1">
                      {tournamentPlayers.slice(0, 6).map((p) => (
                        <div
                          key={p.id}
                          className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs text-white font-bold"
                          style={{ backgroundColor: p.color ?? '#9ca3af' }}
                          title={p.name}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {tournamentPlayers.length > 6 && (
                        <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-400 flex items-center justify-center text-xs text-white font-bold">
                          +{tournamentPlayers.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tournament.tournamentRounds.length} smazzate giocate
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tournament.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : tournament.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {tournament.status === 'active' ? 'In corso' : tournament.status === 'pending' ? 'In attesa' : 'Concluso'}
                </span>
              </div>
              <div className="mt-4 flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/tournaments/${tournament.id}`} className="btn-primary">
                  {tournament.status === 'pending' ? '⚙ Configura' : '👁 Gestisci'}
                </Link>
                {deleteConfirm === tournament.id ? (
                  <button onClick={() => handleDelete(tournament.id)} className="btn-danger">
                    Conferma
                  </button>
                ) : (
                  <button onClick={() => handleDelete(tournament.id)} className="btn-secondary text-red-600 hover:text-red-700">
                    🗑 Elimina
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
