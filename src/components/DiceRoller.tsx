import { motion, AnimatePresence } from 'framer-motion';
import { Dice } from './Dice';
import { getEventLabel, getEventEmoji } from '../utils/gameRules';
import type { RollEvent } from '../utils/types';

interface DiceRollerProps {
  lastRoll: [number, number];
  currentTurnScore: number;
  lastEvent: RollEvent;
  isRolling: boolean;
  hasRolled: boolean;
}

export function DiceRoller({
  lastRoll,
  currentTurnScore,
  lastEvent,
  isRolling,
  hasRolled,
}: DiceRollerProps) {
  const [d1, d2] = lastRoll;
  const sum = d1 + d2;
  const showDice = hasRolled || isRolling;

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        <Dice value={isRolling ? Math.floor(Math.random() * 6) + 1 : d1 || 1} isRolling={isRolling} size="lg" />
        <Dice value={isRolling ? Math.floor(Math.random() * 6) + 1 : d2 || 1} isRolling={isRolling} size="lg" />
      </div>

      <AnimatePresence mode="wait">
        {lastEvent && hasRolled && !isRolling && (
          <motion.div
            key={lastEvent}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`
              px-4 py-2 rounded-xl text-center font-semibold text-sm sm:text-base
              ${lastEvent === 'doublePig' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : ''}
              ${lastEvent === 'pig' ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50' : ''}
              ${lastEvent === 'doubleBonus' ? 'bg-orange-500/20 text-orange-200 border border-orange-500/50' : ''}
              ${lastEvent === 'jackpot' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50' : ''}
              ${lastEvent === 'normal' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : ''}
            `}
          >
            <span className="mr-2">{getEventEmoji(lastEvent)}</span>
            {getEventLabel(lastEvent) || `Résultat : ${sum}`}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-200">
        {showDice && (
          <span className="text-lg sm:text-xl font-medium">
            Résultat : <strong className="text-white">{sum}</strong>
          </span>
        )}
        <span className="text-lg sm:text-xl font-medium">
          Score du tour : <strong className="text-gold-light">{currentTurnScore}</strong>
        </span>
      </div>
    </div>
  );
}
