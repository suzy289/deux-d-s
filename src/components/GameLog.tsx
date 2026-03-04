import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LogEntry } from '../utils/types';

const actionIcons: Record<LogEntry['action'], string> = {
  roll: '🎲',
  hold: '💾',
  pig: '❌',
  doublePig: '🐷',
  doubleBonus: '🔥',
  jackpot: '🎉',
};

interface GameLogProps {
  log: LogEntry[];
  maxHeight?: string;
}

export function GameLog({ log, maxHeight = '12rem' }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div
      className="rounded-xl bg-slate-900/60 border border-slate-600/50 overflow-hidden"
      style={{ maxHeight }}
    >
      <div className="px-3 py-2 border-b border-slate-600/50 flex items-center gap-2 text-slate-400 text-sm font-medium">
        <span>Historique</span>
      </div>
      <div className="overflow-y-auto p-2 space-y-1" style={{ maxHeight: `calc(${maxHeight} - 2.5rem)` }}>
        {log.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">Aucune action pour le moment.</p>
        ) : (
          log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-700/30"
            >
              <span className="flex-shrink-0">{actionIcons[entry.action]}</span>
              <span
                className="flex-shrink-0 font-medium w-20 truncate"
                style={{ color: entry.playerColor }}
              >
                {entry.playerName}
              </span>
              <span className="text-slate-300 flex-1 min-w-0">
                {entry.message}
                {entry.detail && (
                  <span className="text-slate-500 ml-1">— {entry.detail}</span>
                )}
              </span>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
