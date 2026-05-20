'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { exportPlayersToCSV } from '@/lib/export';

export default function PlayersPage() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const presetColors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const handleAddPlayer = () => {
    if (!name.trim()) return;
    addPlayer(name, color);
    setName('');
    setColor('#22c55e');
    setShowForm(false);
  };

  const handleUpdatePlayer = (id: string) => {
    if (!name.trim()) return;
    updatePlayer(id, { name, color });
    setName('');
    setEditingId(null);
    setColor('#22c55e');
  };

  const startEdit = (player: { id: string; name: string; color?: string }) => {
    setName(player.name);
    setColor(player.color ?? '#22c55e');
    setEditingId(player.id);
    setShowForm(false);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setColor('#22c55e');
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deletePlayer(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Giocatori</h1>
        <div className="flex space-x-2">
          {players.length > 0 && (
            <button onClick={() => exportPlayersToCSV(players)} className="btn-secondary">
              📊 Esporta CSV
            </button>
          )}
          <button onClick={() => { setShowForm(true); setEditingId(null); setName(''); setColor('#22c55e'); }} className="btn-primary">
            + Aggiungi Giocatore
          </button>
        </div>
      </div>

      {(showForm || editingId) && (
        <div className="card space-y-4">
          <h2 className="text-xl font-bold">{editingId ? 'Modifica Giocatore' : 'Nuovo Giocatore'}</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Nome giocatore"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  editingId ? handleUpdatePlayer(editingId) : handleAddPlayer();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colore</label>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
                title="Colore personalizzato"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => (editingId ? handleUpdatePlayer(editingId) : handleAddPlayer())}
              className="btn-primary"
            >
              {editingId ? 'Aggiorna' : 'Aggiungi'}
            </button>
            <button onClick={cancelForm} className="btn-secondary">
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {players.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nessun giocatore. Aggiungi il primo!</p>
          </div>
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
                  <th className="table-header text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="table-cell text-center">
                      <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-gray-500'}`}>
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
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
                    <td className="table-cell">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => startEdit(player)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                          Modifica
                        </button>
                        {deleteConfirm === player.id ? (
                          <button onClick={() => handleDelete(player.id)} className="text-red-600 font-bold text-sm">
                            Conferma
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(player.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                            Elimina
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
