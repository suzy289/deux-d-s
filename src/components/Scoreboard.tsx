import { motion } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../utils/types';

interface ScoreboardProps {
  players: Player[];
  maxScore: number;
  currentPlayerIndex: number;
  currentTurnScore: number;
  onPlayerNameChange?: (index: number, name: string) => void;
  editableNames?: boolean;
}

export function Scoreboard({
  players,
  maxScore,
  currentPlayerIndex,
  currentTurnScore,
  onPlayerNameChange,
  editableNames = true,
}: ScoreboardProps) {
  return (
    <div
      className={`
        grid gap-3 sm:gap-4
        ${players.length === 2 ? 'grid-cols-2' : ''}
        ${players.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : ''}
        ${players.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : ''}
      `}
    >
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PlayerCard
            player={player}
            maxScore={maxScore}
            currentTurnScore={currentPlayerIndex === index ? currentTurnScore : 0}
            isActive={currentPlayerIndex === index}
            onNameChange={onPlayerNameChange ? (name) => onPlayerNameChange(index, name) : undefined}
            editable={editableNames}
          />
        </motion.div>
      ))}
    </div>
  );
}
