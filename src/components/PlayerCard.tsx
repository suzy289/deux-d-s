import { motion } from 'framer-motion';
import type { Player } from '../utils/types';

interface PlayerCardProps {
  player: Player;
  maxScore: number;
  currentTurnScore: number;
  isActive: boolean;
  onNameChange?: (name: string) => void;
  editable?: boolean;
}

export function PlayerCard({
  player,
  maxScore,
  currentTurnScore,
  isActive,
  onNameChange,
  editable = true,
}: PlayerCardProps) {
  const progress = Math.min(100, (player.totalScore / maxScore) * 100);

  return (
    <motion.div
      layout
      className={`
        relative rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300
        ${isActive
          ? 'border-amber-400 dark:border-amber-400 shadow-lg shadow-amber-500/20 bg-slate-800/80 dark:bg-slate-800/80'
          : 'border-slate-600/50 bg-slate-800/40 dark:bg-slate-800/40 hover:border-slate-500'
        }
      `}
      animate={isActive ? { boxShadow: ['0 0 20px rgba(251,191,36,0.2)', '0 0 30px rgba(251,191,36,0.35)', '0 0 20px rgba(251,191,36,0.2)'] } : {}}
      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
    >
      {isActive && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl" title="Joueur actif">
          👑
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/30"
          style={{ backgroundColor: player.color }}
        />
        {editable && onNameChange ? (
          <input
            type="text"
            value={player.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-slate-500 focus:border-amber-400 focus:outline-none text-white font-semibold text-sm sm:text-base truncate"
            maxLength={12}
          />
        ) : (
          <span className="font-semibold text-white text-sm sm:text-base truncate">
            {player.name}
            {player.isAI && <span className="text-slate-400 ml-1">(IA)</span>}
          </span>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
        {player.totalScore}
        <span className="text-slate-400 text-sm font-normal ml-1">/ {maxScore}</span>
      </div>
      {isActive && (
        <div className="mt-2 text-amber-300 text-sm font-medium">
          Tour : <span className="text-amber-200">{currentTurnScore}</span> pts
        </div>
      )}
      <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: player.color }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 25 }}
        />
      </div>
    </motion.div>
  );
}
