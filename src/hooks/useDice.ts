import { useCallback } from 'react';
import { rollDice, processRoll } from '../utils/gameRules';
import type { RollResult } from '../utils/types';
import { DICE_ANIMATION_MS } from '../utils/constants';

export function useDice() {
  const roll = useCallback((): [number, number] => rollDice(), []);
  const evaluate = useCallback((die1: number, die2: number): RollResult => processRoll(die1, die2), []);
  const animationDuration = DICE_ANIMATION_MS;
  return { roll, evaluate, animationDuration };
}
