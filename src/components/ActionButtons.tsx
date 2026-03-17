import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onRoll: () => void;
  onReplayRound: () => void;
  canRoll: boolean;
  isRolling: boolean;
  isAiTurn: boolean;
  phase: 'rolling' | 'finished';
  timerRemaining: number | null;
}

export function ActionButtons({
  onRoll,
  onReplayRound,
  canRoll,
  isRolling,
  isAiTurn,
  phase,
  timerRemaining,
}: ActionButtonsProps) {
  if (phase === 'finished') {
    return (
      <div className="flex flex-col items-center gap-2 mt-2">
        <motion.button
          type="button"
          onClick={onReplayRound}
          className="px-8 py-4 sm:px-12 sm:py-5 rounded-xl font-bold text-lg sm:text-xl uppercase tracking-wider bg-casino-accent text-casino-dark shadow-lg shadow-casino-accent/30 hover:bg-casino-accent-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Rejouer le tour
        </motion.button>
        <p className="text-amber-200/80 text-sm">Même paramètres, premier joueur tiré au hasard</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-2">
      {timerRemaining !== null && timerRemaining > 0 && (
        <p className="text-amber-200/90 text-sm">
          Temps restant : <strong className="text-casino-accent">{timerRemaining}s</strong>
        </p>
      )}
      <motion.button
        type="button"
        onClick={onRoll}
        disabled={!canRoll || isRolling || isAiTurn}
        className={`
          px-8 py-4 sm:px-12 sm:py-5 rounded-xl font-bold text-lg sm:text-xl uppercase tracking-wider
          flex items-center justify-center gap-2 transition-all min-w-[200px]
          ${canRoll && !isRolling && !isAiTurn
            ? 'bg-casino-accent text-casino-dark shadow-lg shadow-casino-accent/30 hover:bg-casino-accent-hover hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-amber-900/50 text-amber-200/50 cursor-not-allowed border border-amber-800/50'
          }
        `}
      >
        {isRolling ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-casino-dark border-t-transparent rounded-full animate-spin" />
            <span>Lancement...</span>
          </>
        ) : (
          <>
            <span aria-hidden>🎲</span>
            <span>Lancer les dés</span>
          </>
        )}
      </motion.button>
      {isAiTurn && <p className="text-amber-200/80 text-sm">Au tour de l’IA...</p>}
    </div>
  );
}
