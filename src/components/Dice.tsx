import { motion } from 'framer-motion';

const DOTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.2, 0.2], [0.8, 0.8]],
  3: [[0.2, 0.2], [0.5, 0.5], [0.8, 0.8]],
  4: [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]],
  5: [[0.2, 0.2], [0.8, 0.2], [0.5, 0.5], [0.2, 0.8], [0.8, 0.8]],
  6: [[0.2, 0.25], [0.8, 0.25], [0.2, 0.5], [0.8, 0.5], [0.2, 0.75], [0.8, 0.75]],
};

interface DiceProps {
  value: number;
  isRolling?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Dice({ value, isRolling = false, size = 'md' }: DiceProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 sm:w-14 sm:h-14',
    md: 'w-16 h-16 sm:w-20 sm:h-20',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
  };
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  const clamped = Math.min(6, Math.max(1, value));
  const dots = DOTS[clamped] ?? DOTS[1];

  return (
    <motion.div
      className={`
        ${sizeClasses[size]}
        rounded-lg dice-casino
        bg-gradient-to-br from-white via-gray-50 to-gray-100
        border border-gray-200/80
        flex items-center justify-center relative overflow-hidden
      `}
      animate={
        isRolling
          ? {
              rotateX: [0, 180, 360],
              rotateY: [0, 180, 360],
              scale: [1, 1.12, 1],
              transition: { duration: 0.5, ease: 'easeOut' },
            }
          : {}
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 flex flex-wrap content-center justify-center p-[15%]">
        {dots.map(([x, y], i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-gray-800 ${dotSizes[size]}`}
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
