import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LogEntry } from '../utils/types';

const actionIcons: Record<LogEntry['action'], string> = {
  roll: '🎲',
  round_win: '🏆',
  million_win: '🎉',
  tie: '🤝',
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
      className="rounded-xl overflow-hidden bg-casino-dark/90 border border-amber-900/50 shadow-xl"
      style={{ maxHeight }}
    >
      <div className="px-4 py-2.5 border-b border-amber-900/50 flex items-center gap-2 text-casino-accent text-sm font-semibold uppercase tracking-wider">
        <span aria-hidden>📋</span>
        Historique
      </div>
      <div className="overflow-y-auto p-2 space-y-1 bg-black/20" style={{ maxHeight: `calc(${maxHeight} - 2.75rem)` }}>
        {log.length === 0 ? (
          <p className="text-amber-200/50 text-sm py-6 text-center">Aucune action.</p>
        ) : (
          log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-sm py-2 px-2 rounded-lg hover:bg-amber-950/30 transition-colors"
            >
              <span className="flex-shrink-0">{actionIcons[entry.action]}</span>
              <span
                className="flex-shrink-0 font-medium w-20 truncate"
                style={{ color: entry.playerColor }}
              >
                {entry.playerName}
              </span>
              <span className="text-amber-100/80 flex-1 min-w-0">
                {entry.message}
                {entry.detail && <span className="text-amber-200/50 ml-1">— {entry.detail}</span>}
              </span>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
