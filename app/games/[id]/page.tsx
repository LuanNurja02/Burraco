'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store';
import { TeamScore, BurracoType } from '@/types';
import { calculateTeamScore, BURRACO_POINTS, getCumulativeScore } from '@/lib/scoring';
import { exportGameToPDF, exportGameToCSV } from '@/lib/export';
import { shareToWhatsApp, shareToTelegram, copyToClipboard } from '@/lib/share';
import { speak, playWinSound, playHandSound } from '@/lib/audio';
import GameTimer from '@/components/GameTimer';

export default function GameDetailPage() {
  const params = useParams();
  const gameId = typeof params.id === 'string' ? params.id : '';
  const { games, players, addHand, updateGameStatus, deleteHand, enableVoice, enableSound, toggleVoice, toggleSound } = useStore();
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteHandConfirm, setDeleteHandConfirm] = useState<string | null>(null);

  const game = games.find((g) => g.id === gameId);

  useEffect(() => {
    if (game?.winner && enableVoice) {
      speak(`${game.winner} ha vinto la partita!`, true);
    }
  }, [game?.winner]);

  if (!game) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Partita non trovata</p>
        <Link href="/games" className="btn-primary">
          ← Torna alle Partite
        </Link>
      </div>
    );
  }

  const handleAddHand = (handTeams: TeamScore[]) => {
    addHand(game.id, {
      handNumber: game.currentHand,
      dealer: game.currentDealer,
      teams: handTeams,
    });
    setShowScoreForm(false);

    if (enableVoice) {
      const scores = handTeams.map((t) => `${t.teamName}: ${calculateTeamScore(t)}`).join(', ');
      speak(`Smazzata ${game.currentHand}. ${scores}`, true);
    }
    playHandSound(enableSound);
  };

  const handleDeleteHand = (handId: string) => {
    if (deleteHandConfirm === handId) {
      deleteHand(game.id, handId);
      setDeleteHandConfirm(null);
    } else {
      setDeleteHandConfirm(handId);
      setTimeout(() => setDeleteHandConfirm(null), 3000);
    }
  };

  const handleExportPDF = () => {
    exportGameToPDF(game);
  };

  const handleExportCSV = () => {
    exportGameToCSV(game);
  };

  const handleShareWhatsApp = () => {
    shareToWhatsApp(game);
    setShowShareMenu(false);
  };

  const handleShareTelegram = () => {
    shareToTelegram(game);
    setShowShareMenu(false);
  };

  const handleCopyToClipboard = async () => {
    const ok = await copyToClipboard(game);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name ?? '';
  const getPlayerColor = (id: string) => players.find((p) => p.id === id)?.color ?? '#9ca3af';
  const dealerName = game.teams.find((t) => t.id === game.currentDealer)?.name ?? '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/games" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
            ← Torna alle Partite
          </Link>
          <h1 className="text-3xl font-bold mt-1">
            {game.mode} <span className="text-gray-400">•</span> {game.type}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Target: {game.targetScore} punti | Smazzata {game.currentHand}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-lg transition-colors ${
              enableVoice
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}
            title={enableVoice ? 'Disattiva voce' : 'Attiva voce'}
          >
            {enableVoice ? '🔊' : '🔇'}
          </button>
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors ${
              enableSound
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}
            title={enableSound ? 'Disattiva suoni' : 'Attiva suoni'}
          >
            {enableSound ? '🔔' : '🔕'}
          </button>
          {game.status === 'active' && (
            <button onClick={() => setShowScoreForm(true)} className="btn-primary">
              + Aggiungi Punteggio
            </button>
          )}
          {game.status === 'active' && (
            <button onClick={() => updateGameStatus(game.id, 'paused')} className="btn-secondary">
              ⏸ Pausa
            </button>
          )}
          {game.status === 'paused' && (
            <button onClick={() => updateGameStatus(game.id, 'active')} className="btn-primary">
              ▶ Riprendi
            </button>
          )}
          {game.hands.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className="btn-secondary">
                📤 Condividi
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[180px]">
                  <button onClick={handleShareWhatsApp} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                    <span>💬</span><span>WhatsApp</span>
                  </button>
                  <button onClick={handleShareTelegram} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                    <span>✈️</span><span>Telegram</span>
                  </button>
                  <button onClick={handleCopyToClipboard} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                    <span>{copied ? '✅' : '📋'}</span><span>{copied ? 'Copiato!' : 'Copia testo'}</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                    <span>📄</span><span>Esporta PDF</span>
                  </button>
                  <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                    <span>📊</span><span>Esporta CSV</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {game.winner && (
        <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
              {game.winner} Vince!
            </h2>
            <p className="text-green-600 dark:text-green-400 mt-1">
              Partita conclusa in {game.hands.length} smazzate
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {game.teams.map((team) => {
          const cumulativeScore = getCumulativeScore(game, team.id);
          const progress = Math.min((cumulativeScore / game.targetScore) * 100, 100);
          const lastHand = game.hands[game.hands.length - 1];
          const lastHandScore = lastHand?.teams.find((t) => t.teamId === team.id)?.totalPoints ?? 0;
          const teamPlayers = team.playerIds.map((id) => ({
            name: getPlayerName(id),
            color: getPlayerColor(id),
          })).filter((p) => p.name);
          const isDealer = game.currentDealer === team.id;

          return (
            <div key={team.id} className={`card ${isDealer && game.status === 'active' ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold">{team.name}</h3>
                  {isDealer && game.status === 'active' && (
                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-bold">
                      🃏 Mazziere
                    </span>
                  )}
                </div>
                {teamPlayers.length > 0 && (
                  <div className="flex -space-x-1">
                    {teamPlayers.map((p, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: p.color }}
                        title={p.name}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {teamPlayers.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {teamPlayers.map((p, i) => (
                    <span key={i} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Punteggio totale</span>
                  <span className="font-bold text-lg">{cumulativeScore}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      cumulativeScore >= game.targetScore ? 'bg-green-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>{game.targetScore}</span>
                </div>
              </div>
              {game.hands.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Ultima smazzata: <span className="font-semibold text-gray-700 dark:text-gray-300">{lastHandScore} pts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">⏱ Timer Partita</h2>
        <GameTimer gameStatus={game.status} />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">📋 Storico Smazzate</h2>
        {game.hands.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nessuna smazzata giocata</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="table-header text-center">Smazzata</th>
                  <th className="table-header text-center">Mazziere</th>
                  {game.teams.map((team) => (
                    <th key={team.id} className="table-header text-center">{team.name}</th>
                  ))}
                  <th className="table-header text-center">Totale</th>
                  <th className="table-header text-center"></th>
                </tr>
              </thead>
              <tbody>
                {game.hands.map((hand) => {
                  const dealerName = game.teams.find((t) => t.id === hand.dealer)?.name ?? '-';
                  let rowTotal = 0;
                  return (
                    <tr key={hand.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="table-cell text-center font-semibold">{hand.handNumber}</td>
                      <td className="table-cell text-center text-sm text-gray-500">{dealerName}</td>
                      {game.teams.map((team) => {
                        const teamScore = hand.teams.find((t) => t.teamId === team.id);
                        const pts = teamScore?.totalPoints ?? 0;
                        rowTotal += pts;
                        return (
                          <td key={team.id} className={`table-cell text-center font-semibold ${pts < 0 ? 'text-red-600' : pts > 0 ? 'text-green-600' : ''}`}>
                            {pts > 0 ? '+' : ''}{pts}
                          </td>
                        );
                      })}
                      <td className="table-cell text-center font-bold">{rowTotal}</td>
                      <td className="table-cell text-center">
                        {game.status === 'active' && (
                          deleteHandConfirm === hand.id ? (
                            <button onClick={() => handleDeleteHand(hand.id)} className="text-red-600 font-bold text-xs">
                              Conferma
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteHand(hand.id)}
                              className="text-gray-400 hover:text-red-600 text-xs transition-colors"
                              title="Elimina smazzata"
                            >
                              ✕
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 dark:bg-gray-700/50 font-bold">
                  <td className="table-cell text-center" colSpan={2}>TOTALE</td>
                  {game.teams.map((team) => (
                    <td key={team.id} className="table-cell text-center text-lg text-primary-600">
                      {getCumulativeScore(game, team.id)}
                    </td>
                  ))}
                  <td className="table-cell text-center">
                    {game.teams.reduce((sum, team) => sum + getCumulativeScore(game, team.id), 0)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {game.hands.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">📊 Dettaglio Ultima Smazzata</h2>
          {(() => {
            const lastHand = game.hands[game.hands.length - 1];
            if (!lastHand) return null;
            return (
              <div className="space-y-4">
                {lastHand.teams.map((team) => (
                  <div key={team.teamId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-bold mb-2">{team.teamName} - {team.totalPoints} pts</h4>
                    {team.runs.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Sequenze:</span> {team.runs.length} ({team.runs.reduce((s, r) => s + r.points, 0)} pts)
                        {team.runs.some((r) => r.isPozzetto) && ' + Pozzetto'}
                      </div>
                    )}
                    {team.burracos.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Burraco:</span> {team.burracos.map((b) => `${b.type} (${b.points})`).join(', ')}
                      </div>
                    )}
                    {team.closedCards > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Chiusura:</span> +{team.closedCards}
                      </div>
                    )}
                    {team.penaltyCards > 0 && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        <span className="font-medium">Penalità:</span> -{team.penaltyCards}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {showScoreForm && (
        <ScoreForm
          teams={game.teams}
          players={players}
          currentDealer={game.currentDealer}
          handNumber={game.currentHand}
          onSubmit={handleAddHand}
          onCancel={() => setShowScoreForm(false)}
        />
      )}
    </div>
  );
}

function ScoreForm({
  teams,
  players,
  currentDealer,
  handNumber,
  onSubmit,
  onCancel,
}: {
  teams: { id: string; name: string; playerIds: string[] }[];
  players: { id: string; name: string; color?: string }[];
  currentDealer: string;
  handNumber: number;
  onSubmit: (teams: TeamScore[]) => void;
  onCancel: () => void;
}) {
  const [teamScores, setTeamScores] = useState<TeamScore[]>(
    teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      runs: [],
      burracos: [],
      closedCards: 0,
      penaltyCards: 0,
      totalPoints: 0,
    }))
  );

  const [selectedDealer, setSelectedDealer] = useState(currentDealer);

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name ?? '';
  const getPlayerColor = (id: string) => players.find((p) => p.id === id)?.color ?? '#9ca3af';

  const deepCloneScores = (): TeamScore[] => {
    return JSON.parse(JSON.stringify(teamScores));
  };

  const addRun = (teamIndex: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.runs.push({
      id: `run-${Date.now()}-${Math.random()}`,
      cards: [],
      points: 0,
      isPozzetto: false,
    });
    setTeamScores(newScores);
  };

  const addBurraco = (teamIndex: number, type: BurracoType) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.burracos.push({
      id: `burraco-${Date.now()}-${Math.random()}`,
      type,
      points: BURRACO_POINTS[type],
    });
    setTeamScores(newScores);
  };

  const updateRunPoints = (teamIndex: number, runIndex: number, points: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.runs[runIndex]!.points = points;
    setTeamScores(newScores);
  };

  const updateRunPozzetto = (teamIndex: number, runIndex: number, isPozzetto: boolean) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.runs[runIndex]!.isPozzetto = isPozzetto;
    setTeamScores(newScores);
  };

  const removeRun = (teamIndex: number, runIndex: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.runs = newScores[teamIndex]!.runs.filter((_, i) => i !== runIndex);
    setTeamScores(newScores);
  };

  const removeBurraco = (teamIndex: number, burracoIndex: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.burracos = newScores[teamIndex]!.burracos.filter((_, i) => i !== burracoIndex);
    setTeamScores(newScores);
  };

  const updateClosedCards = (teamIndex: number, value: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.closedCards = value;
    setTeamScores(newScores);
  };

  const updatePenaltyCards = (teamIndex: number, value: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.penaltyCards = value;
    setTeamScores(newScores);
  };

  const handleSubmit = () => {
    const calculatedTeams = teamScores.map((team) => ({
      ...team,
      totalPoints: calculateTeamScore(team),
    }));
    onSubmit(calculatedTeams);
  };

  const quickAddPoints = (teamIndex: number, points: number) => {
    const newScores = deepCloneScores();
    newScores[teamIndex]!.runs.push({
      id: `run-quick-${Date.now()}-${Math.random()}`,
      cards: [],
      points,
      isPozzetto: false,
    });
    setTeamScores(newScores);
  };

  return (
    <div className="card space-y-6 border-2 border-primary-200 dark:border-primary-800">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">📝 Inserisci Punteggio - Smazzata {handNumber}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">
          ✕
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mazziere</label>
        <select
          value={selectedDealer}
          onChange={(e) => setSelectedDealer(e.target.value)}
          className="input max-w-xs"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {teamScores.map((team, teamIndex) => {
        const teamPlayers = teams[teamIndex]?.playerIds.map((id) => ({
          name: getPlayerName(id),
          color: getPlayerColor(id),
        })).filter((p) => p.name) ?? [];

        return (
        <div key={team.teamId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{team.teamName}</h3>
            {teamPlayers.length > 0 && (
              <div className="flex -space-x-1">
                {teamPlayers.map((p, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: p.color }}
                    title={p.name}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-sm">Sequenze (Scale)</label>
              <div className="flex space-x-1">
                <button onClick={() => quickAddPoints(teamIndex, 30)} className="btn-secondary text-xs px-2 py-1">
                  +30
                </button>
                <button onClick={() => quickAddPoints(teamIndex, 50)} className="btn-secondary text-xs px-2 py-1">
                  +50
                </button>
                <button onClick={() => quickAddPoints(teamIndex, 80)} className="btn-secondary text-xs px-2 py-1">
                  +80
                </button>
                <button onClick={() => addRun(teamIndex)} className="btn-secondary text-xs px-2 py-1">
                  + Personalizzato
                </button>
              </div>
            </div>
            {team.runs.length === 0 && (
              <p className="text-xs text-gray-400 italic">Nessuna sequenza inserita</p>
            )}
            {team.runs.map((run, runIndex) => (
              <div key={run.id} className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-400 w-6">#{runIndex + 1}</span>
                <input
                  type="number"
                  value={run.points || ''}
                  onChange={(e) => updateRunPoints(teamIndex, runIndex, parseInt(e.target.value) || 0)}
                  className="input w-24"
                  placeholder="Punti"
                  min={0}
                />
                <label className="flex items-center space-x-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={run.isPozzetto}
                    onChange={(e) => updateRunPozzetto(teamIndex, runIndex, e.target.checked)}
                    className="rounded"
                  />
                  <span>Pozzetto (+100)</span>
                </label>
                <button onClick={() => removeRun(teamIndex, runIndex)} className="text-red-500 hover:text-red-700 text-sm ml-auto">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-sm">Burraco</label>
              <div className="flex space-x-1">
                <button onClick={() => addBurraco(teamIndex, 'clean')} className="btn-secondary text-xs px-2 py-1">
                  Pulito (200)
                </button>
                <button onClick={() => addBurraco(teamIndex, 'semiclean')} className="btn-secondary text-xs px-2 py-1">
                  Semipulito (150)
                </button>
                <button onClick={() => addBurraco(teamIndex, 'dirty')} className="btn-secondary text-xs px-2 py-1">
                  Sporco (100)
                </button>
              </div>
            </div>
            {team.burracos.map((burraco, burracoIndex) => (
              <div key={burraco.id} className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  burraco.type === 'clean' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                  burraco.type === 'semiclean' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                }`}>
                  {burraco.type === 'clean' ? 'Pulito' : burraco.type === 'semiclean' ? 'Semipulito' : 'Sporco'}
                </span>
                <span className="font-semibold">{burraco.points} pts</span>
                <button onClick={() => removeBurraco(teamIndex, burracoIndex)} className="text-red-500 hover:text-red-700 text-sm ml-auto">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bonus Chiusura</label>
              <input
                type="number"
                value={team.closedCards || ''}
                onChange={(e) => updateClosedCards(teamIndex, parseInt(e.target.value) || 0)}
                className="input"
                placeholder="0"
                min={0}
              />
              <p className="text-xs text-gray-400 mt-1">+100 se ha chiuso</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Carte in mano (penalità)</label>
              <input
                type="number"
                value={team.penaltyCards || ''}
                onChange={(e) => updatePenaltyCards(teamIndex, parseInt(e.target.value) || 0)}
                className="input"
                placeholder="0"
                min={0}
              />
              <p className="text-xs text-gray-400 mt-1">Valore carte rimaste</p>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg flex justify-between items-center">
            <span className="font-bold">Totale smazzata:</span>
            <span className={`text-2xl font-bold ${calculateTeamScore(team) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateTeamScore(team) > 0 ? '+' : ''}{calculateTeamScore(team)} pts
            </span>
          </div>
        </div>
        );
      })}

      <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={handleSubmit} className="btn-primary text-lg px-8 py-3">
          ✓ Salva Smazzata
        </button>
        <button onClick={onCancel} className="btn-secondary text-lg px-6 py-3">
          Annulla
        </button>
      </div>
    </div>
  );
}
