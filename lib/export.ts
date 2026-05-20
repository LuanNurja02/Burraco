import { Game, Player, Tournament } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportGameToPDF(game: Game): void {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(22, 163, 74);
  doc.text('Burraco Manager - Referto Partita', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Modalita: ${game.mode}  |  Tipo: ${game.type}  |  Target: ${game.targetScore} punti`, 14, 30);
  doc.text(`Stato: ${game.status === 'finished' ? 'Conclusa' : game.status === 'paused' ? 'In pausa' : 'In corso'}`, 14, 37);
  if (game.winner) {
    doc.setTextColor(22, 163, 74);
    doc.text(`Vincitore: ${game.winner}`, 14, 44);
  }

  const cumulativeScores = game.teams.map((team) => {
    let total = 0;
    for (const hand of game.hands) {
      const hs = hand.teams.find((t) => t.teamId === team.id);
      if (hs) total += hs.totalPoints;
    }
    return total;
  });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const scoreLine = game.teams.map((t, i) => `${t.name}: ${cumulativeScores[i]}`).join('  |  ');
  doc.text(scoreLine, 14, game.winner ? 51 : 44);

  const tableData = game.hands.map((hand) => {
    const row: (string | number)[] = [hand.handNumber.toString()];
    const dealerName = game.teams.find((t) => t.id === hand.dealer)?.name ?? '-';
    row.push(dealerName);
    for (const team of hand.teams) {
      row.push(team.totalPoints);
    }
    return row;
  });

  const headers = ['Smazzata', 'Mazziere', ...game.teams.map((t) => t.name)];

  autoTable(doc, {
    startY: game.winner ? 56 : 49,
    head: [headers],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'center' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? 70;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('TOTALI', 14, finalY + 10);
  let x = 55;
  for (let i = 0; i < cumulativeScores.length; i++) {
    doc.text(cumulativeScores[i].toString(), x, finalY + 10);
    x += 40;
  }

  doc.save(`burraco-${game.mode}-${game.type}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportPlayersToCSV(players: Player[]): void {
  const headers = ['Nome', 'Partite', 'Vittorie', 'Vinte %', 'Punti Totali', 'Media Punti', 'Record'];
  const rows = players.map((p) => [
    p.name,
    p.stats.gamesPlayed.toString(),
    p.stats.gamesWon.toString(),
    p.stats.gamesPlayed > 0 ? ((p.stats.gamesWon / p.stats.gamesPlayed) * 100).toFixed(1) + '%' : '0%',
    p.stats.totalPoints.toString(),
    p.stats.gamesPlayed > 0 ? p.stats.averagePoints.toFixed(0) : '0',
    p.stats.bestGame.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `burraco-giocatori-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportGameToCSV(game: Game): void {
  const headers = ['Smazzata', 'Mazziere', ...game.teams.flatMap((t) => [`${t.name} Punti`, `${t.name} Burraco`, `${t.name} Sequenze`])];
  const rows = game.hands.map((h) => {
    const dealerName = game.teams.find((t) => t.id === h.dealer)?.name ?? '-';
    const row = [h.handNumber.toString(), dealerName];
    for (const team of h.teams) {
      const burracoPts = team.burracos.reduce((s, b) => s + b.points, 0);
      const runPts = team.runs.reduce((s, r) => s + r.points + (r.isPozzetto ? 100 : 0), 0);
      row.push(team.totalPoints.toString(), burracoPts.toString(), runPts.toString());
    }
    return row;
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `burraco-partita-${game.id}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTournamentToPDF(tournament: Tournament, players: { id: string; name: string; color?: string }[]): void {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(22, 163, 74);
  doc.text('Burraco Manager - Referto Torneo', 14, 20);

  const formatLabels: Record<string, string> = { pairs: 'Coppie', singles: 'Singolare', teams: 'Squadre' };
  const movementLabels: Record<string, string> = { mitchell: 'Mitchell', danese: 'Danese', american: 'Americano' };

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`${tournament.name}`, 14, 30);
  doc.text(`${formatLabels[tournament.format]}  |  ${movementLabels[tournament.movement]}  |  ${tournament.numRounds} smazzate  |  Target: ${tournament.targetScore}`, 14, 38);
  doc.text(`Stato: ${tournament.status === 'finished' ? 'Concluso' : tournament.status === 'active' ? 'In corso' : 'In attesa'}`, 14, 45);

  const sortedPlayers = players
    .filter((p) => tournament.playerIds.includes(p.id))
    .map((player) => {
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
    })
    .sort((a, b) => {
      if (b.totalVP !== a.totalVP) return b.totalVP - a.totalVP;
      if (b.totalMP !== a.totalMP) return b.totalMP - a.totalMP;
      return b.totalPoints - a.totalPoints;
    });

  const winner = sortedPlayers[0];
  if (winner) {
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`Vincitore: ${winner.name}  (VP: ${winner.totalVP} | MP: ${winner.totalMP} | Punti: ${winner.totalPoints})`, 14, 53);
  }

  const rankingData = sortedPlayers.map((p, i) => [
    i + 1,
    p.name,
    p.totalVP,
    p.totalMP,
    p.totalPoints,
  ]);

  autoTable(doc, {
    startY: winner ? 58 : 50,
    head: [['Pos', 'Giocatore', 'VP', 'MP', 'Punti']],
    body: rankingData,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
  });

  if (tournament.tournamentRounds.length > 0) {
    const roundStartY = (doc as any).lastAutoTable?.finalY + 15 ?? 80;

    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('Risultati Smazzate', 14, roundStartY);

    for (const round of tournament.tournamentRounds) {
      const roundData = round.tables.map((t) => [
        `Smazzata ${round.number}`,
        t.homeTeam,
        t.homeScore,
        t.awayScore,
        t.awayTeam,
        `VP: ${t.homeVP}-${t.awayVP}`,
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY + 5 ?? roundStartY + 5,
        head: [['', 'Casa', '', '', 'Ospite', '']],
        body: roundData,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 100, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { halign: 'right' },
          2: { halign: 'center', fontStyle: 'bold', cellWidth: 15 },
          3: { halign: 'center', fontStyle: 'bold', cellWidth: 15 },
          4: { halign: 'left' },
          5: { halign: 'center', cellWidth: 25 },
        },
      });
    }
  }

  doc.save(`burraco-torneo-${tournament.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportTournamentToCSV(tournament: Tournament, players: { id: string; name: string }[]): void {
  const sortedPlayers = players
    .filter((p) => tournament.playerIds.includes(p.id))
    .map((player) => {
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

      return { name: player.name, totalVP, totalMP, totalPoints };
    })
    .sort((a, b) => {
      if (b.totalVP !== a.totalVP) return b.totalVP - a.totalVP;
      if (b.totalMP !== a.totalMP) return b.totalMP - a.totalMP;
      return b.totalPoints - a.totalPoints;
    });

  const headers = ['Pos', 'Giocatore', 'VP', 'MP', 'Punti'];
  const rows = sortedPlayers.map((p, i) => [
    (i + 1).toString(),
    p.name,
    p.totalVP.toString(),
    p.totalMP.toString(),
    p.totalPoints.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `burraco-torneo-${tournament.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
