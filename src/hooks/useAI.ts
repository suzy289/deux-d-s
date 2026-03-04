import { useCallback } from 'react';
import type { Player } from '../utils/types';
import { AI_THRESHOLDS } from '../utils/constants';
import type { AIDifficulty } from '../utils/types';

export function useAI() {
  const shouldHold = useCallback(
    (
      currentTurnScore: number,
      totalScore: number,
      player: Player,
      maxScore: number,
      opponentsMaxScore: number
    ): boolean => {
      const difficulty = (player.aiDifficulty || 'normale') as AIDifficulty;
      const threshold = AI_THRESHOLDS[difficulty];

      if (difficulty === 'adaptative') {
        const gap = opponentsMaxScore - totalScore;
        const dynamicThreshold = Math.min(25, Math.max(15, Math.floor(gap / 5) + 15));
        return currentTurnScore >= dynamicThreshold || totalScore + currentTurnScore >= maxScore;
      }

      if (difficulty === 'agressive') {
        if (totalScore >= 80) return currentTurnScore >= 15;
        return currentTurnScore >= 30 || totalScore + currentTurnScore >= maxScore;
      }

      return currentTurnScore >= threshold || totalScore + currentTurnScore >= maxScore;
    },
    []
  );

  return { shouldHold };
}
