export interface Player {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  createdAt: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  averagePoints: number;
  bestGame: number;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
}

export type GameMode = '1v1' | '2v2' | '1v1v1';
export type GameType = '1005' | '2005' | '2505' | 'custom';
export type BurracoType = 'clean' | 'dirty' | 'semiclean';

export interface HandEntry {
  id: string;
  handNumber: number;
  dealer: string;
  teams: TeamScore[];
  createdAt: string;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  runs: RunEntry[];
  burracos: BurracoEntry[];
  closedCards: number;
  penaltyCards: number;
  totalPoints: number;
}

export interface RunEntry {
  id: string;
  cards: string[];
  points: number;
  isPozzetto: boolean;
}

export interface BurracoEntry {
  id: string;
  type: BurracoType;
  points: number;
}

export interface Game {
  id: string;
  mode: GameMode;
  type: GameType;
  targetScore: number;
  teams: Team[];
  hands: HandEntry[];
  currentHand: number;
  currentDealer: string;
  status: 'active' | 'paused' | 'finished';
  winner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'pairs' | 'singles' | 'teams';
  movement: 'mitchell' | 'danese' | 'american';
  numRounds: number;
  targetScore: number;
  playerIds: string[];
  tables: TournamentTable[];
  tournamentRounds: TournamentRound[];
  status: 'pending' | 'active' | 'finished';
  createdAt: string;
}

export interface TournamentPlayer {
  id: string;
  name: string;
  partnerId?: string;
  totalVP: number;
  totalMP: number;
  totalPoints: number;
}

export interface TournamentTable {
  id: string;
  number: number;
  homeTeam: string;
  awayTeam: string;
  round: number;
}

export interface TournamentRound {
  id: string;
  number: number;
  tables: MatchResult[];
  completed: boolean;
}

export interface MatchResult {
  tableNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeVP: number;
  awayVP: number;
}
