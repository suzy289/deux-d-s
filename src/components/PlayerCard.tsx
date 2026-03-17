import { motion } from 'framer-motion';
import type { Player } from '../utils/types';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onNameChange?: (name: string) => void;
  editable?: boolean;
}

export function PlayerCard({
  player,
  isActive,
  onNameChange,
  editable = true,
}: PlayerCardProps) {
  return (
    <motion.div
      layout
      className={`
        relative rounded-xl p-3 sm:p-4 transition-all duration-300
        ${isActive
          ? 'bg-amber-950/40 border-2 border-casino-accent player-active-ring rounded-xl'
          : 'bg-black/25 border border-amber-900/30 rounded-xl'
        }
      `}
      animate={isActive ? {
        boxShadow: ['0 0 0 3px #e8a317', '0 0 20px rgba(232, 163, 23, 0.5)', '0 0 0 3px #e8a317'],
      } : {}}
      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-shrink-0">
          <div
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold
              ${isActive ? 'border-casino-accent player-active-ring' : 'border-white/30'}
            `}
            style={{ backgroundColor: player.color }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          {isActive && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl" aria-hidden>👑</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editable && onNameChange ? (
            <input
              type="text"
              value={player.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full bg-transparent border-b border-transparent hover:border-amber-600/50 focus:border-casino-accent focus:outline-none text-amber-100 font-semibold text-sm sm:text-base truncate"
              maxLength={12}
              placeholder="Nom"
            />
          ) : (
            <span className="font-semibold text-amber-100 text-sm sm:text-base truncate block">
              {player.name}
              {player.isAI && <span className="text-amber-200/60 ml-1 text-xs">(IA)</span>}
            </span>
          )}
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="text-lg font-bold text-white">
              {player.lastRoll !== null ? (
                player.rollSum > 0 ? (
                  <>Score ce tour : {player.rollSum}</>
                ) : (
                  <span className="text-amber-200/70">Passé</span>
                )
              ) : (
                <span className="text-amber-200/60">—</span>
              )}
            </span>
            <span className="text-casino-accent text-sm font-medium">
              Tours gagnés : {player.roundWins}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
