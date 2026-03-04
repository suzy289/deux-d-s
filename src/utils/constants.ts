export const SCORE_OPTIONS = [50, 75, 100, 150] as const;
export const DEFAULT_MAX_SCORE = 100;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const JACKPOT_BONUS = 25;

export const PLAYER_COLORS = [
  '#ef4444', // rouge
  '#3b82f6', // bleu
  '#22c55e', // vert
  '#eab308', // jaune
];

export const DEFAULT_PLAYER_NAMES = ['Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4'];

export const AI_THRESHOLDS = {
  prudente: 15,
  normale: 20,
  agressive: 30,
  adaptative: 20,
} as const;

export const DICE_ANIMATION_MS = 500;
export const AI_TURN_DELAY_MS = 800;
