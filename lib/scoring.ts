import { BurracoType, TeamScore } from '@/types';

export const CARD_VALUES: Record<string, number> = {
  'A': 15,
  '2': 20,
  '3': 5,
  '4': 5,
  '5': 5,
  '6': 5,
  '7': 5,
  'J': 10,
  'Q': 10,
  'K': 10,
};

export const BURRACO_POINTS: Record<BurracoType, number> = {
  'clean': 200,
  'semiclean': 150,
  'dirty': 100,
};

export const POZZETTO_BONUS = 100;
export const CHIUSURA_BONUS = 100;

export function calculateRunPoints(cards: string[]): number {
  return cards.reduce((sum, card) => {
    const baseCard = card.split('-')[0] ?? card;
    const value = CARD_VALUES[baseCard] ?? 5;
    return sum + value;
  }, 0);
}

export function calculateBurracoPoints(type: BurracoType): number {
  return BURRACO_POINTS[type];
}

export function calculateTeamScore(team: Omit<TeamScore, 'totalPoints'>): number {
  let total = 0;

  for (const run of team.runs) {
    total += run.points;
    if (run.isPozzetto) {
      total += POZZETTO_BONUS;
    }
  }

  for (const burraco of team.burracos) {
    total += burraco.points;
  }

  total += team.closedCards;
  total -= team.penaltyCards;

  return total;
}

export function getCumulativeScore(game: { hands: { teams: { teamId: string; totalPoints: number }[] }[] }, teamId: string): number {
  let total = 0;
  for (const hand of game.hands) {
    const teamScore = hand.teams.find((t) => t.teamId === teamId);
    if (teamScore) {
      total += teamScore.totalPoints;
    }
  }
  return total;
}

export function calculateVictoryPoints(homeScore: number, awayScore: number, targetScore: number): { homeVP: number; awayVP: number } {
  const homeWon = homeScore >= targetScore;
  const awayWon = awayScore >= targetScore;

  if (homeWon && awayWon) {
    const diff = homeScore - awayScore;
    if (diff > 100) return { homeVP: 3, awayVP: 0 };
    return { homeVP: 2, awayVP: 1 };
  }

  if (homeWon) return { homeVP: 3, awayVP: 0 };
  if (awayWon) return { homeVP: 0, awayVP: 3 };

  const diff = Math.abs(homeScore - awayScore);
  if (homeScore > awayScore) {
    return diff > 100 ? { homeVP: 2, awayVP: 0 } : { homeVP: 1, awayVP: 0 };
  }
  return diff > 100 ? { homeVP: 0, awayVP: 2 } : { homeVP: 0, awayVP: 1 };
}

export function calculateMatchPoints(homeScore: number, awayScore: number): { homeMP: number; awayMP: number } {
  if (homeScore > awayScore) return { homeMP: 2, awayMP: 0 };
  if (awayScore > homeScore) return { homeMP: 0, awayMP: 2 };
  return { homeMP: 1, awayMP: 1 };
}

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'] as const;

export function generateDeck(): string[] {
  const deck: string[] = [];
  for (let i = 0; i < 2; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(`${rank}-${suit}`);
      }
    }
  }
  return deck;
}
