import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Tournament, GameMode, GameType, Team, HandEntry, TournamentRound } from '@/types';
import { calculateTeamScore, getCumulativeScore } from '@/lib/scoring';

const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    } catch {
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    } catch {
    }
  },
};

interface GameState {
  games: Game[];
  players: Player[];
  tournaments: Tournament[];
  activeGameId: string | null;
  darkMode: boolean;
  enableVoice: boolean;
  enableSound: boolean;
  _hasHydrated: boolean;

  addPlayer: (name: string, color?: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;

  createGame: (mode: GameMode, type: GameType, teams: { name: string; playerIds: string[] }[]) => void;
  addHand: (gameId: string, hand: Omit<HandEntry, 'id' | 'createdAt'>) => void;
  deleteHand: (gameId: string, handId: string) => void;
  updateGameStatus: (gameId: string, status: Game['status']) => void;
  setActiveGame: (gameId: string | null) => void;
  deleteGame: (gameId: string) => void;

  createTournament: (name: string, format: Tournament['format'], movement: Tournament['movement'], numRounds: number, targetScore: number, playerIds: string[]) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  addTournamentRound: (tournamentId: string, round: Omit<TournamentRound, 'id'>) => void;

  toggleDarkMode: () => void;
  applyDarkMode: () => void;
  toggleVoice: () => void;
  toggleSound: () => void;
  setHasHydrated: (state: boolean) => void;
}

function updatePlayerStats(players: Player[], game: Game): Player[] {
  return players.map((player) => {
    let playerBelongsToTeam: string | null = null;
    let playerTeamScore = 0;

    for (const team of game.teams) {
      if (team.playerIds.includes(player.id)) {
        playerBelongsToTeam = team.id;
        playerTeamScore = getCumulativeScore(game, team.id);
        break;
      }
    }

    if (!playerBelongsToTeam) return player;

    const isWinner = game.winner !== undefined && game.teams.find((t) => t.id === playerBelongsToTeam)?.name === game.winner;

    const newGamesPlayed = player.stats.gamesPlayed + 1;
    const newGamesWon = player.stats.gamesWon + (isWinner ? 1 : 0);
    const newTotalPoints = player.stats.totalPoints + playerTeamScore;
    const newAveragePoints = newTotalPoints / newGamesPlayed;
    const newBestGame = Math.max(player.stats.bestGame, playerTeamScore);

    return {
      ...player,
      stats: {
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        totalPoints: newTotalPoints,
        averagePoints: newAveragePoints,
        bestGame: newBestGame,
      },
    };
  });
}

export const useStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: [],
      players: [],
      tournaments: [],
      activeGameId: null,
      darkMode: false,
      enableVoice: true,
      enableSound: true,
      _hasHydrated: false,

      addPlayer: (name, color) => {
        const newPlayer: Player = {
          id: uuidv4(),
          name,
          color,
          createdAt: new Date().toISOString(),
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalPoints: 0,
            averagePoints: 0,
            bestGame: 0,
          },
        };
        set((state) => ({ players: [...state.players, newPlayer] }));
      },

      updatePlayer: (id, updates) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePlayer: (id) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        }));
      },

      createGame: (mode, type, teamConfigs) => {
        const targetScore = type === '1005' ? 1005 : type === '2005' ? 2005 : type === '2505' ? 2505 : 2005;

        const teams: Team[] = teamConfigs.map((config) => ({
          id: uuidv4(),
          name: config.name || 'Team',
          playerIds: config.playerIds,
        }));

        const newGame: Game = {
          id: uuidv4(),
          mode,
          type,
          targetScore,
          teams,
          hands: [],
          currentHand: 1,
          currentDealer: teams[0]?.id ?? '',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          games: [...state.games, newGame],
          activeGameId: newGame.id,
        }));
      },

      addHand: (gameId, handData) => {
        set((state) => {
          const game = state.games.find((g) => g.id === gameId);
          if (!game) return state;

          const hand: HandEntry = {
            ...handData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };

          for (const team of hand.teams) {
            team.totalPoints = calculateTeamScore(team);
          }

          let winner: string | undefined;
          for (const team of hand.teams) {
            const cumulative = getCumulativeScore({ hands: [...game.hands, hand] }, team.teamId);
            if (cumulative >= game.targetScore && !winner) {
              winner = team.teamName;
            }
          }

          const dealerIndex = game.teams.findIndex((t) => t.id === game.currentDealer);
          const nextDealerIndex = (dealerIndex + 1) % game.teams.length;
          const nextDealer = game.teams[nextDealerIndex]?.id ?? game.currentDealer;

          const updatedGame: Game = {
            ...game,
            hands: [...game.hands, hand],
            currentHand: game.currentHand + 1,
            currentDealer: nextDealer,
            status: winner ? 'finished' : game.status,
            winner,
            updatedAt: new Date().toISOString(),
          };

          const updatedGames = state.games.map((g) => (g.id === gameId ? updatedGame : g));

          if (winner) {
            const updatedPlayers = updatePlayerStats(state.players, updatedGame);
            return { games: updatedGames, players: updatedPlayers };
          }

          return { games: updatedGames };
        });
      },

      deleteHand: (gameId, handId) => {
        set((state) => {
          const game = state.games.find((g) => g.id === gameId);
          if (!game) return state;

          const handIndex = game.hands.findIndex((h) => h.id === handId);
          if (handIndex === -1) return state;

          const newHands = game.hands.filter((h) => h.id !== handId);

          let newWinner: string | undefined;
          for (const team of game.teams) {
            const cumulative = getCumulativeScore({ hands: newHands }, team.id);
            if (cumulative >= game.targetScore) {
              newWinner = team.name;
            }
          }

          const dealerIndex = game.teams.findIndex((t) => t.id === game.currentDealer);
          const prevDealerIndex = handIndex > 0
            ? (dealerIndex - 1 + game.teams.length) % game.teams.length
            : 0;
          const prevDealer = game.teams[prevDealerIndex]?.id ?? game.currentDealer;

          const updatedGame: Game = {
            ...game,
            hands: newHands,
            currentHand: game.currentHand - 1,
            currentDealer: prevDealer,
            status: newWinner ? 'finished' : 'active',
            winner: newWinner,
            updatedAt: new Date().toISOString(),
          };

          return {
            games: state.games.map((g) => (g.id === gameId ? updatedGame : g)),
          };
        });
      },

      updateGameStatus: (gameId, status) => {
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, status, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },

      setActiveGame: (gameId) => {
        set({ activeGameId: gameId });
      },

      deleteGame: (gameId) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
          activeGameId: state.activeGameId === gameId ? null : state.activeGameId,
        }));
      },

      createTournament: (name, format, movement, numRounds, targetScore, playerIds) => {
        const newTournament: Tournament = {
          id: uuidv4(),
          name,
          format,
          movement,
          numRounds,
          targetScore,
          playerIds,
          tables: [],
          tournamentRounds: [],
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          tournaments: [...state.tournaments, newTournament],
        }));
      },

      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter((t) => t.id !== id),
        }));
      },

      addTournamentRound: (tournamentId, roundData) => {
        const newRound: TournamentRound = {
          ...roundData,
          id: uuidv4(),
        };

        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId
              ? { ...t, tournamentRounds: [...t.tournamentRounds, newRound] }
              : t
          ),
        }));
      },

      toggleDarkMode: () => {
        set((state) => {
          const newMode = !state.darkMode;
          if (typeof document !== 'undefined') {
            if (newMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { darkMode: newMode };
        });
      },

      applyDarkMode: () => {
        const state = get();
        if (typeof document !== 'undefined') {
          if (state.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleVoice: () => {
        set((state) => ({ enableVoice: !state.enableVoice }));
      },

      toggleSound: () => {
        set((state) => ({ enableSound: !state.enableSound }));
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'burraco-storage',
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate state:', error);
        }
        if (state) {
          state.setHasHydrated(true);
          state.applyDarkMode();
        }
      },
    }
  )
);

export function useHydratedStore<T>(selector: (state: GameState) => T): T {
  const hasHydrated = useStore((state) => state._hasHydrated);
  const result = useStore(selector);

  if (!hasHydrated) {
    return selector({
      games: [],
      players: [],
      tournaments: [],
      activeGameId: null,
      darkMode: false,
      enableVoice: true,
      enableSound: true,
      _hasHydrated: false,
      addPlayer: () => {},
      updatePlayer: () => {},
      deletePlayer: () => {},
      createGame: () => {},
      addHand: () => {},
      deleteHand: () => {},
      updateGameStatus: () => {},
      setActiveGame: () => {},
      deleteGame: () => {},
      createTournament: () => {},
      updateTournament: () => {},
      deleteTournament: () => {},
      addTournamentRound: () => {},
      toggleDarkMode: () => {},
      applyDarkMode: () => {},
      toggleVoice: () => {},
      toggleSound: () => {},
      setHasHydrated: () => {},
    } as GameState);
  }

  return result;
}
