import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameSettings, Player, AIDifficulty } from '../utils/types';
import { PLAYER_COLORS, DEFAULT_PLAYER_NAMES, THINKING_TIME_OPTIONS } from '../utils/constants';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  players: Player[];
  onApply: (settings: Partial<GameSettings>, players: Player[]) => void;
}

const AI_OPTIONS: { value: AIDifficulty; label: string }[] = [
  { value: 'prudente', label: 'Prudente' },
  { value: 'normale', label: 'Normale' },
  { value: 'agressive', label: 'Agressive' },
  { value: 'adaptative', label: 'Adaptative' },
];

function createPlayer(id: number, name: string, color: string, isAI: boolean): Player {
  return {
    id,
    name,
    color,
    isAI,
    lastRoll: null,
    rollSum: 0,
    roundWins: 0,
  };
}

export function SettingsPanel({
  isOpen,
  onClose,
  currentSettings,
  players,
  onApply,
}: SettingsPanelProps) {
  const [playerCount, setPlayerCount] = useState(currentSettings.playerCount);
  const [millionRule, setMillionRule] = useState(currentSettings.millionRule);
  const [thinkingTimeSeconds, setThinkingTimeSeconds] = useState(currentSettings.thinkingTimeSeconds);
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);

  useEffect(() => {
    if (!isOpen) return;
    setPlayerCount(currentSettings.playerCount);
    setMillionRule(currentSettings.millionRule);
    setThinkingTimeSeconds(currentSettings.thinkingTimeSeconds);
    if (players.length === currentSettings.playerCount) {
      setLocalPlayers(players.map((p) => ({ ...p })));
    } else {
      setLocalPlayers(
        Array.from({ length: currentSettings.playerCount }, (_, i) =>
          createPlayer(i + 1, DEFAULT_PLAYER_NAMES[i], PLAYER_COLORS[i], false)
        )
      );
    }
  }, [isOpen, currentSettings, players]);

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
          ...Array.from({ length: count - prev.length }, (_, i) =>
            createPlayer(prev.length + i + 1, DEFAULT_PLAYER_NAMES[prev.length + i], PLAYER_COLORS[prev.length + i], false)
          ),
        ];
      }
      return prev.slice(0, count);
    });
  };

  const handleApply = () => {
    onApply(
      { playerCount, millionRule, thinkingTimeSeconds },
      localPlayers.map((p) => ({ ...p, lastRoll: null, rollSum: 0, roundWins: 0 }))
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
            className="bg-casino-dark border border-amber-900/60 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-900/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Paramètres</h2>
              <button type="button" onClick={onClose} className="text-amber-200/70 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Nombre de joueurs (2 à 4)</label>
                <select
                  value={playerCount}
                  onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-amber-800/50 focus:border-casino-accent focus:outline-none"
                >
                  {[2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} joueurs</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="millionRule"
                  checked={millionRule}
                  onChange={(e) => setMillionRule(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-700 bg-black/30 text-casino-accent focus:ring-casino-accent"
                />
                <label htmlFor="millionRule" className="text-amber-200/80 text-sm">
                  Règle du Million : double 1 (somme 2) gagne automatiquement le tour
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Temps de réflexion (secondes)</label>
                <select
                  value={thinkingTimeSeconds}
                  onChange={(e) => setThinkingTimeSeconds(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-amber-800/50 focus:border-casino-accent focus:outline-none"
                >
                  {THINKING_TIME_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === 0 ? 'Illimité' : `${s} s`}
                    </option>
                  ))}
                </select>
                <p className="text-amber-200/60 text-xs mt-1">Si le temps est dépassé, le tour est perdu.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-3">Joueurs</label>
                <div className="space-y-3">
                  {localPlayers.map((player, index) => (
                    <div key={player.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
                      <div className="w-8 h-8 rounded-full border-2 border-amber-700/50 flex-shrink-0" style={{ backgroundColor: player.color }} />
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, { name: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-1.5 rounded bg-black/30 text-white border border-amber-800/50 focus:border-casino-accent focus:outline-none text-sm"
                        placeholder="Nom"
                      />
                      <label className="flex items-center gap-2 text-sm text-amber-200/80">
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
                          onChange={(e) => updatePlayer(index, { aiDifficulty: e.target.value as AIDifficulty })}
                          className="px-2 py-1 rounded bg-black/30 text-white border border-amber-800/50 text-sm"
                        >
                          {AI_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-amber-900/50 flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium bg-white/10 text-amber-100 border border-amber-700/50 hover:bg-white/20">
                Annuler
              </button>
              <button type="button" onClick={handleApply} className="px-4 py-2 rounded-lg font-medium bg-casino-accent text-casino-dark hover:bg-casino-accent-hover">
                Appliquer et nouvelle partie
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
