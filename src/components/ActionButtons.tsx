import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onRoll: () => void;
  onHold: () => void;
  canRoll: boolean;
  canHold: boolean;
  isRolling: boolean;
  isAiTurn: boolean;
}

export function ActionButtons({
  onRoll,
  onHold,
  canRoll,
  canHold,
  isRolling,
  isAiTurn,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <motion.button
        type="button"
        onClick={onRoll}
        disabled={!canRoll || isRolling || isAiTurn}
        className={`
          px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-lg
          flex items-center gap-2 transition-all
          ${canRoll && !isRolling && !isAiTurn
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-100'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }
        `}
        whileHover={canRoll && !isRolling && !isAiTurn ? { scale: 1.02 } : {}}
        whileTap={canRoll && !isRolling && !isAiTurn ? { scale: 0.98 } : {}}
      >
        {isRolling ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            Lancement...
          </>
        ) : (
          <>
            <span>🎲</span>
            Lancer les dés
          </>
        )}
      </motion.button>
      <motion.button
        type="button"
        onClick={onHold}
        disabled={!canHold || isRolling || isAiTurn}
        className={`
          px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-lg
          flex items-center gap-2 transition-all
          ${canHold && !isRolling && !isAiTurn
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-100'
            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }
        `}
        whileHover={canHold && !isRolling && !isAiTurn ? { scale: 1.02 } : {}}
        whileTap={canHold && !isRolling && !isAiTurn ? { scale: 0.98 } : {}}
      >
        <span>💾</span>
        Garder
      </motion.button>
      {isAiTurn && (
        <p className="text-slate-400 text-sm w-full text-center">C’est au tour de l’IA...</p>
      )}
    </div>
  );
}
