# 🃏 Burraco Manager

App web professionale per la gestione di partite e tornei di Burraco, ispirata a GTBurraco e UpBurraco.

## ✨ Funzionalità

### Gestione Partite
- **Modalità**: 1vs1, 2vs2 (coppie), 1vs1vs1 (3 giocatori)
- **Punteggio target**: 1005, 2005, 2505 o personalizzato
- **Inserimento punteggio smazzata per smazzata**
- **Calcolo automatico**: Sequenze, Burraco (pulito/semipulito/sporco), Pozzetto, Chiusura
- **Barra progresso** verso il punteggio target
- **Storico completo** di tutte le smazzate
- **Pausa/Riprendi** partita
- **Esporta** in PDF e CSV

### Gestione Giocatori
- **Anagrafica giocatori** con colore personalizzato
- **Statistiche automatiche**: partite giocate, vittorie, punti totali, media, record
- **Classifica** con percentuali vittorie
- **Esporta** in CSV

### Gestione Tornei
- **Formati**: Coppie, Singolare, Squadre
- **Movimenti**: Mitchell, Danese, Americano
- **Configurazione giocatori** e smazzate
- **Inserimento risultati** smazzata per smazzata
- **Classifica automatica** con VP (Victory Points) e MP (Match Points)

### Interfaccia
- **Dark mode** con persistenza
- **Design responsive** (desktop, tablet, mobile)
- **Interfaccia in italiano**
- **Salvataggio automatico** nel browser (localStorage)

## 🚀 Installazione

### Prerequisiti
- Node.js 18+ (https://nodejs.org)

### Avvio
```bash
cd C:\Users\Lonià\Desktop\Burraco
npm install
npm run dev
```

Apri http://localhost:3000 nel browser.

### Build produzione
```bash
npm run build
npm start
```

## 📁 Struttura Progetto

```
burraco-manager/
├── app/                      # Pagine Next.js (App Router)
│   ├── layout.tsx           # Layout principale
│   ├── page.tsx             # Dashboard home
│   ├── games/               # Gestione partite
│   │   ├── page.tsx         # Lista partite
│   │   └── [id]/page.tsx    # Dettaglio + inserimento punteggio
│   ├── players/             # Gestione giocatori
│   ├── tournaments/         # Gestione tornei
│   │   ├── page.tsx         # Lista tornei
│   │   └── [id]/page.tsx    # Dettaglio torneo
│   └── statistics/          # Statistiche e classifiche
├── components/              # Componenti riutilizzabili
│   ├── Header.tsx           # Navigazione
│   └── RootProvider.tsx     # Provider dark mode
├── lib/                     # Utility
│   ├── scoring.ts           # Motore calcolo punteggio Burraco
│   └── export.ts            # Esportazione PDF/CSV
├── store/                   # State management (Zustand)
│   └── index.ts             # Store con persistenza localStorage
├── types/                   # Definizioni TypeScript
│   └── index.ts             # Tipi per Game, Player, Tournament
└── public/                  # Risorse statiche
```

## 📋 Regole Punteggio Burraco

### Valore Carte
| Carta | Punti |
|-------|-------|
| Asso (A) | 15 |
| Due (2) | 20 |
| 3-7 | 5 |
| Fanti (J), Donna (Q), Re (K) | 10 |

### Burraco
| Tipo | Punti |
|------|-------|
| Pulito (senza matte) | 200 |
| Semipulito | 150 |
| Sporco (con matte) | 100 |

### Bonus
| Voce | Punti |
|------|-------|
| Pozzetto | +100 |
| Chiusura | +100 |
| Carte in mano (penalità) | -valore |

### Victory Points (Tornei)
- Entrambi superano target: chi ha più punti prende 3 VP, l'altro 0 (se differenza > 100) o 2-1
- Solo uno supera target: 3 VP a chi vince, 0 all'altro
- Nessuno supera target: 2-0 se differenza > 100, altrimenti 1-0

## 🛠 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + persist (localStorage)
- **PDF**: jsPDF + autoTable
- **UUID**: uuid

## 📝 License

MIT
