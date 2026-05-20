import { Game } from '@/types';
import { getCumulativeScore } from '@/lib/scoring';

export function getShareText(game: Game): string {
  const lines: string[] = [];
  lines.push(`🃏 Burraco Manager`);
  lines.push(``);
  lines.push(`Partita: ${game.mode} - ${game.type}`);
  lines.push(`Target: ${game.targetScore} punti`);
  lines.push(`Smazzate: ${game.hands.length}`);
  lines.push(``);

  if (game.status === 'finished' && game.winner) {
    lines.push(`🏆 Vincitore: ${game.winner}`);
    lines.push(``);
  }

  for (const team of game.teams) {
    const total = getCumulativeScore(game, team.id);
    lines.push(`${team.name}: ${total} punti`);
  }

  lines.push(``);
  lines.push(`Generato da Burraco Manager`);

  return lines.join('\n');
}

export function shareToWhatsApp(game: Game) {
  const text = getShareText(game);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

export function shareToTelegram(game: Game) {
  const text = getShareText(game);
  const encoded = encodeURIComponent(text);
  window.open(`https://t.me/share/url?text=${encoded}`, '_blank');
}

export function copyToClipboard(game: Game): Promise<boolean> {
  const text = getShareText(game);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
  }
  return Promise.resolve(false);
}
