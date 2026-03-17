import { motion } from 'framer-motion';
import { Dice } from './Dice';
import type { Player } from '../utils/types';

interface DiceRollerProps {
  currentPlayer: Player | null;
  isRolling: boolean;
  roundNumber: number;
  millionRuleTriggered: boolean;
  phase: 'rolling' | 'finished';
  roundWinners: Player[];
}

export function DiceRoller({
  currentPlayer,
  isRolling,
  roundNumber,
  millionRuleTriggered,
  phase,
  roundWinners,
}: DiceRollerProps) {
  const hasRolled = currentPlayer != null && currentPlayer.lastRoll !== null && (currentPlayer.lastRoll[0] + currentPlayer.lastRoll[1]) > 0;
  const [d1, d2] = currentPlayer?.lastRoll ?? [0, 0];
  const sum = d1 + d2;
  const isTie = roundWinners.length > 1;

  if (phase === 'finished') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-amber-200/90 text-sm">Tour n° {roundNumber} terminé</p>
        {millionRuleTriggered && (
          <p className="text-casino-accent font-bold">🎉 Règle du Million — Double 1 gagne le tour !</p>
        )}
        {isTie ? (
          <p className="text-amber-100 font-semibold text-center">
            Égalité entre {roundWinners.map((w) => w.name).join(' et ')} — partage du tour.
          </p>
        ) : roundWinners.length > 0 && roundWinners[0] ? (
          <p className="text-amber-100 font-semibold text-center">
            Gagnant du tour : <span style={{ color: roundWinners[0].color }}>{roundWinners[0].name}</span>
            {` avec ${roundWinners[0].rollSum}`}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <p className="text-amber-200/90 text-sm">Tour n° {roundNumber} — {currentPlayer ? `À ${currentPlayer.name} de lancer` : ''}</p>
      <div className="flex items-center justify-center gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-2">
          <Dice
            value={d1 >= 1 && d1 <= 6 ? d1 : 1}
            isRolling={isRolling}
            size="lg"
          />
          <span className="text-amber-200/80 text-sm font-medium">Dé 1 : {d1 >= 1 && d1 <= 6 ? d1 : '—'}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Dice
            value={d2 >= 1 && d2 <= 6 ? d2 : 1}
            isRolling={isRolling}
            size="lg"
          />
          <span className="text-amber-200/80 text-sm font-medium">Dé 2 : {d2 >= 1 && d2 <= 6 ? d2 : '—'}</span>
        </div>
      </div>
      {hasRolled && (
        <div className="text-center text-amber-100/90">
          <p className="text-lg font-medium">
            Face dé 1 : <strong className="text-white">{d1}</strong>
            {' + '}
            Face dé 2 : <strong className="text-white">{d2}</strong>
            {' → '}
            Somme : <strong className="text-casino-accent">{sum}</strong>
          </p>
          <p className="text-sm text-amber-200/70 mt-1">Les numéros affichés sur les deux faces sont additionnés.</p>
        </div>
      )}
      {millionRuleTriggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-2 rounded-lg bg-casino-accent/30 text-amber-950 font-bold text-sm sm:text-base border border-casino-accent"
        >
          🎉 Règle du Million — Double 1 gagne le tour !
        </motion.div>
      )}
    </div>
  );
}