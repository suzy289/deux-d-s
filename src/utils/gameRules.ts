import type { RollResult } from './types';

export function processRoll(die1: number, die2: number): RollResult {
  if (die1 === 1 && die2 === 1) {
    return {
      event: 'doublePig',
      points: 0,
      resetTotal: true,
      turnEnds: true,
      mustRoll: false,
    };
  }
  if (die1 === 1 || die2 === 1) {
    return {
      event: 'pig',
      points: 0,
      resetTotal: false,
      turnEnds: true,
      mustRoll: false,
    };
  }
  if (die1 === 6 && die2 === 6) {
    return {
      event: 'jackpot',
      points: 12 + 25,
      resetTotal: false,
      turnEnds: false,
      mustRoll: false,
    };
  }
  if (die1 === die2) {
    return {
      event: 'doubleBonus',
      points: (die1 + die2) * 2,
      resetTotal: false,
      turnEnds: false,
      mustRoll: true,
    };
  }
  return {
    event: 'normal',
    points: die1 + die2,
    resetTotal: false,
    turnEnds: false,
    mustRoll: false,
  };
}

export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

export function getEventLabel(event: string | null): string {
  switch (event) {
    case 'doublePig':
      return 'COCHON ! Tu perds tout !';
    case 'pig':
      return 'PIG ! Tu perds ce tour';
    case 'doubleBonus':
      return 'DOUBLE BONUS ! Points doublés !';
    case 'jackpot':
      return 'JACKPOT ! +25 pts bonus !';
    default:
      return '';
  }
}

export function getEventEmoji(event: string | null): string {
  switch (event) {
    case 'doublePig':
      return '🐷';
    case 'pig':
      return '❌';
    case 'doubleBonus':
      return '🔥';
    case 'jackpot':
      return '🎉';
    default:
      return '';
  }
}
