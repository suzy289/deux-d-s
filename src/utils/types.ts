export type RollEvent = 'pig' | 'doublePig' | 'doubleBonus' | 'jackpot' | 'normal' | null;

export type AIDifficulty = 'prudente' | 'normale' | 'agressive' | 'adaptative';

export interface Player {
  id: number;
  name: string;
  totalScore: number;
  isActive: boolean;
  isAI: boolean;
  color: string;
  aiDifficulty?: AIDifficulty;
}

export interface GameSettings {
  maxScore: number;
  lastTurnMode: boolean;
  playerCount: number;
}

export interface LogEntry {
  id: string;
  turnNumber: number;
  playerName: string;
  playerColor: string;
  action: 'roll' | 'hold' | 'pig' | 'doublePig' | 'doubleBonus' | 'jackpot';
  message: string;
  detail?: string;
  timestamp: number;
}

export interface RollResult {
  event: RollEvent;
  points: number;
  resetTotal: boolean;
  turnEnds: boolean;
  mustRoll: boolean;
}

export interface GameState {
  players: Player[];
  currentTurnScore: number;
  currentPlayerIndex: number;
  lastRoll: [number, number];
  lastEvent: RollEvent;
  isRolling: boolean;
  mustRoll: boolean;
  gameOver: boolean;
  winner: Player | null;
  turnNumber: number;
  log: LogEntry[];
  settings: GameSettings;
  lastTurnTriggered: boolean;
  lastTurnTriggeredAtPlayerIndex: number;
}
