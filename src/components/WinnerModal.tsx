import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Player } from '../utils/types';

interface WinnerModalProps {
  winner: Player | null;
  onClose: () => void;
  onNewGame: () => void;
}

export function WinnerModal({ winner, onClose, onNewGame }: WinnerModalProps) {
  useEffect(() => {
    if (!winner) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [winner.color, '#d4af37', '#fff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [winner.color, '#d4af37', '#fff'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [winner]);

  if (!winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-slate-800 border-2 border-amber-400 rounded-2xl shadow-2xl shadow-amber-500/20 p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-2">Victoire !</h2>
          <p
            className="text-xl font-semibold mb-1"
            style={{ color: winner.color }}
          >
            {winner.name}
          </p>
          <p className="text-slate-400 mb-6">
            a gagné avec <strong className="text-white">{winner.totalScore}</strong> points
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onNewGame}
              className="px-6 py-3 rounded-xl font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors"
            >
              Nouvelle partie
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold bg-slate-600 text-white hover:bg-slate-500 transition-colors"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
