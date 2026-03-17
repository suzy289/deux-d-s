export type AIDifficulty = 'prudente' | 'normale' | 'agressive' | 'adaptative';

export interface Player {
  id: number;
  name: string;
  color: string;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  /** Lancer du tour en cours : [dé1, dé2] ou null si pas encore lancé */
  lastRoll: [number, number] | null;
  /** Somme des dés ce tour (2-12), ou 0 si pas encore lancé */
  rollSum: number;
  /** Nombre de tours gagnés (pour affichage optionnel) */
  roundWins: number;
}

export interface GameSettings {
  playerCount: number;
  /** Règle du Million : double 1 (somme 2) gagne automatiquement le tour */
  millionRule: boolean;
  /** Temps de réflexion en secondes (0 = illimité) */
  thinkingTimeSeconds: number;
}

export interface LogEntry {
  id: string;
  roundNumber: number;
  playerName: string;
  playerColor: string;
  action: 'roll' | 'round_win' | 'million_win' | 'tie';
  message: string;
  detail?: string;
  timestamp: number;
}

export interface GameState {
  players: Player[];
  /** Index du joueur qui doit lancer */
  currentPlayerIndex: number;
  /** Numéro du tour en cours */
  roundNumber: number;
  /** Tous les joueurs ont lancé ce tour */
  allRolled: boolean;
  /** Phase : en cours de lancers ou tour terminé */
  phase: 'rolling' | 'finished';
  /** Gagnant(s) du tour (vide si égalité ou pas encore terminé) */
  roundWinners: Player[];
  /** Double 1 = Règle du Million ce tour */
  millionRuleTriggered: boolean;
  isRolling: boolean;
  log: LogEntry[];
  settings: GameSettings;
  /** Secondes restantes pour le joueur actuel (si temps de réflexion) */
  timerRemaining: number | null;
}
