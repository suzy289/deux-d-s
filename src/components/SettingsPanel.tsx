import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameSettings, Player, AIDifficulty } from '../utils/types';
import { SCORE_OPTIONS, PLAYER_COLORS, DEFAULT_PLAYER_NAMES } from '../utils/constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  players: Player[];
  onApply: (settings: Partial<GameSettings>, players: Player[]) => void;
}

const AI_OPTIONS: { value: AIDifficulty; label: string }[] = [
  { value: 'prudente', label: 'Prudente (garde à 15)' },
  { value: 'normale', label: 'Normale (garde à 20)' },
  { value: 'agressive', label: 'Agressive (garde à 30)' },
  { value: 'adaptative', label: 'Adaptative' },
];

export function SettingsPanel({
  isOpen,
  onClose,
  currentSettings,
  players,
  onApply,
}: SettingsPanelProps) {
  const [playerCount, setPlayerCount] = useState(currentSettings.playerCount);
  const [maxScore, setMaxScore] = useState(currentSettings.maxScore);
  const [lastTurnMode, setLastTurnMode] = useState(currentSettings.lastTurnMode);
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);

  useEffect(() => {
    if (!isOpen) return;
    setPlayerCount(currentSettings.playerCount);
    setMaxScore(currentSettings.maxScore);
    setLastTurnMode(currentSettings.lastTurnMode);
    if (players.length === currentSettings.playerCount) {
      setLocalPlayers(players.map((p) => ({ ...p })));
    } else {
      setLocalPlayers(
        Array.from({ length: currentSettings.playerCount }, (_, i) => ({
          id: i + 1,
          name: DEFAULT_PLAYER_NAMES[i],
          totalScore: 0,
          isActive: i === 0,
          isAI: false,
          color: PLAYER_COLORS[i],
        }))
      );
    }
  }, [isOpen, currentSettings.playerCount, currentSettings.maxScore, currentSettings.lastTurnMode, players]);

  const updatePlayer = (index: number, updates: Partial<Player>) => {
    setLocalPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setLocalPlayers((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, (_, i) => ({
            id: prev.length + i + 1,
            name: DEFAULT_PLAYER_NAMES[prev.length + i],
            totalScore: 0,
            isActive: false,
            isAI: false,
            color: PLAYER_COLORS[prev.length + i],
          })),
        ];
      }
      return prev.slice(0, count);
    });
  };

  const handleApply = () => {
    onApply(
      { playerCount, maxScore, lastTurnMode },
      localPlayers.map((p, i) => ({ ...p, isActive: i === 0 }))
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-600 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Paramètres</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre de joueurs
                </label>
                <select
                  value={playerCount}
                  onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
                >
                  {[2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} joueurs
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Score pour gagner
                </label>
                <select
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-amber-500 focus:outline-none"
                >
                  {SCORE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s} points
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="lastTurn"
                  checked={lastTurnMode}
                  onChange={(e) => setLastTurnMode(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="lastTurn" className="text-slate-300 text-sm">
                  Mode dernier tour (les autres joueurs ont un tour après 100 pts)
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Joueurs
                </label>
                <div className="space-y-3">
                  {localPlayers.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-700/50"
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/30 flex-shrink-0"
                        style={{ backgroundColor: player.color }}
                      />
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, { name: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-1.5 rounded bg-slate-700 text-white border border-slate-600 focus:border-amber-500 focus:outline-none text-sm"
                        placeholder="Nom"
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={player.isAI}
                          onChange={(e) =>
                            updatePlayer(index, {
                              isAI: e.target.checked,
                              aiDifficulty: e.target.checked ? 'normale' : undefined,
                            })
                          }
                        />
                        IA
                      </label>
                      {player.isAI && (
                        <select
                          value={player.aiDifficulty || 'normale'}
                          onChange={(e) =>
                            updatePlayer(index, {
                              aiDifficulty: e.target.value as AIDifficulty,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-700 text-white border border-slate-600 text-sm"
                        >
                          {AI_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-600 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium bg-slate-600 text-white hover:bg-slate-500"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-lg font-medium bg-amber-500 text-slate-900 hover:bg-amber-400"
              >
                Appliquer et nouvelle partie
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
