import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, Player, LogEntry, GameSettings } from '../utils/types';
import {
  PLAYER_COLORS,
  DEFAULT_PLAYER_NAMES,
  MIN_PLAYERS,
  MAX_PLAYERS,
  DICE_ANIMATION_MS,
  AI_TURN_DELAY_MS,
} from '../utils/constants';
import { rollDice, isMillionWin } from '../utils/gameRules';

type Action =
  | { type: 'ROLL_START'; payload: { die1: number; die2: number } }
  | { type: 'ROLL_END' }
  | { type: 'SKIP_TURN' }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET'; payload?: Partial<GameSettings> }
  | { type: 'UPDATE_PLAYER_NAME'; payload: { index: number; name: string } }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'TICK_TIMER' };

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

function createInitialPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) =>
    createPlayer(i + 1, DEFAULT_PLAYER_NAMES[i], PLAYER_COLORS[i], false)
  );
}

function createInitialState(settings?: Partial<GameSettings>): GameState {
  const playerCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, settings?.playerCount ?? 2));
  const players = createInitialPlayers(playerCount);
  return {
    players,
    currentPlayerIndex: 0,
    roundNumber: 1,
    allRolled: false,
    phase: 'rolling',
    roundWinners: [],
    millionRuleTriggered: false,
    isRolling: false,
    log: [],
    settings: {
      playerCount,
      millionRule: settings?.millionRule ?? false,
      thinkingTimeSeconds: settings?.thinkingTimeSeconds ?? 0,
    },
    timerRemaining: settings?.thinkingTimeSeconds ? settings.thinkingTimeSeconds : null,
  };
}

function addLog(
  log: LogEntry[],
  roundNumber: number,
  player: Player,
  action: LogEntry['action'],
  message: string,
  detail?: string
): LogEntry[] {
  return [
    ...log,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roundNumber,
      playerName: player.name,
      playerColor: player.color,
      action,
      message,
      detail,
      timestamp: Date.now(),
    },
  ];
}

function getWinners(players: Player[], millionRuleTriggered: boolean): Player[] {
  if (millionRuleTriggered) {
    const millionWinner = players.find((p) => p.lastRoll && p.lastRoll[0] === 1 && p.lastRoll[1] === 1);
    return millionWinner ? [millionWinner] : [];
  }
  const maxSum = Math.max(...players.map((p) => p.rollSum));
  return players.filter((p) => p.rollSum === maxSum && p.rollSum > 0);
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ROLL_START': {
      const { die1, die2 } = action.payload;
      const sum = die1 + die2;
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, lastRoll: [die1, die2] as [number, number], rollSum: sum }
          : p
      );
      return { ...state, players: newPlayers, isRolling: true };
    }

    case 'ROLL_END': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const lastRoll = currentPlayer?.lastRoll;
      if (!lastRoll) return state;
      const [die1, die2] = lastRoll;
      const sum = die1 + die2;
      let newLog = state.log;
      newLog = addLog(newLog, state.roundNumber, currentPlayer, 'roll', `Lance : face ${die1} + face ${die2} = ${sum}`, undefined);

      const millionWin = isMillionWin(die1, die2, state.settings.millionRule);

      if (millionWin) {
        newLog = addLog(newLog, state.roundNumber, currentPlayer, 'million_win', 'Règle du Million ! Double 1 — gagne le tour.', undefined);
        const withWin = state.players.map((p) =>
          p.id === currentPlayer.id ? { ...p, roundWins: p.roundWins + 1 } : p
        );
        return {
          ...state,
          players: withWin,
          allRolled: true,
          phase: 'finished',
          roundWinners: [{ ...currentPlayer, roundWins: currentPlayer.roundWins + 1 }],
          millionRuleTriggered: true,
          log: newLog,
          isRolling: false,
          timerRemaining: null,
        };
      }

      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const allRolled = state.players.every((p) => p.lastRoll !== null);

      if (allRolled) {
        const winners = getWinners(state.players, false);
        const withWins = state.players.map((p) => {
          const isWinner = winners.some((w) => w.id === p.id);
          return isWinner ? { ...p, roundWins: p.roundWins + 1 } : p;
        });
        let logAfterWins = newLog;
        winners.forEach((w) => {
          const faces = w.lastRoll ? ` (face ${w.lastRoll[0]} + face ${w.lastRoll[1]})` : '';
          logAfterWins = addLog(logAfterWins, state.roundNumber, w, 'round_win', `Gagne le tour avec ${w.rollSum}${faces}`, undefined);
        });
        if (winners.length > 1) {
          logAfterWins = addLog(logAfterWins, state.roundNumber, winners[0], 'tie', 'Égalité — partage du tour.', undefined);
        }
        return {
          ...state,
          players: withWins,
          currentPlayerIndex: nextIndex,
          allRolled: true,
          phase: 'finished',
          roundWinners: winners,
          log: logAfterWins,
          isRolling: false,
          timerRemaining: null,
        };
      }

      const nextTimer = state.settings.thinkingTimeSeconds > 0 ? state.settings.thinkingTimeSeconds : null;
      return {
        ...state,
        currentPlayerIndex: nextIndex,
        log: newLog,
        isRolling: false,
        timerRemaining: nextTimer,
      };
    }

    case 'SKIP_TURN': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, lastRoll: [0, 0] as [number, number], rollSum: 0 } : p
      );
      const newLog = addLog(
        state.log,
        state.roundNumber,
        currentPlayer,
        'roll',
        'Temps écoulé — tour passé.',
        undefined
      );
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const allRolled = newPlayers.every((p) => p.lastRoll !== null);
      if (allRolled) {
        const winners = getWinners(newPlayers, false);
        const withWins = newPlayers.map((p) => {
          const isWinner = winners.some((w) => w.id === p.id);
          return isWinner ? { ...p, roundWins: p.roundWins + 1 } : p;
        });
        let logAfterWins = newLog;
        winners.forEach((w) => {
          logAfterWins = addLog(logAfterWins, state.roundNumber, w, 'round_win', `Gagne le tour avec ${w.rollSum}`, undefined);
        });
        if (winners.length > 1) {
          logAfterWins = addLog(logAfterWins, state.roundNumber, winners[0], 'tie', 'Égalité.', undefined);
        }
        return {
          ...state,
          players: withWins,
          currentPlayerIndex: nextIndex,
          allRolled: true,
          phase: 'finished',
          roundWinners: winners,
          log: logAfterWins,
          timerRemaining: null,
        };
      }
      return {
        ...state,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
        log: newLog,
        timerRemaining: state.settings.thinkingTimeSeconds > 0 ? state.settings.thinkingTimeSeconds : null,
      };
    }

    case 'NEW_ROUND': {
      const resetPlayers = state.players.map((p) => ({
        ...p,
        lastRoll: null,
        rollSum: 0,
      }));
      return {
        ...state,
        players: resetPlayers,
        currentPlayerIndex: 0,
        roundNumber: state.roundNumber + 1,
        allRolled: false,
        phase: 'rolling',
        roundWinners: [],
        millionRuleTriggered: false,
        timerRemaining: state.settings.thinkingTimeSeconds > 0 ? state.settings.thinkingTimeSeconds : null,
      };
    }

    case 'RESET': {
      const nextSettings = { ...state.settings, ...action.payload };
      return createInitialState(nextSettings);
    }

    case 'UPDATE_PLAYER_NAME':
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === action.payload.index ? { ...p, name: action.payload.name } : p
        ),
      };

    case 'SET_PLAYERS':
      return { ...state, players: action.payload };

    case 'TICK_TIMER':
      if (state.timerRemaining === null || state.phase !== 'rolling') return state;
      if (state.timerRemaining <= 1) {
        return { ...state, timerRemaining: 0 };
      }
      return { ...state, timerRemaining: state.timerRemaining - 1 };

    default:
      return state;
  }
}

export function useGameState(initialSettings?: Partial<GameSettings>) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState(initialSettings));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roll = useCallback(() => {
    if (state.phase !== 'rolling' || state.isRolling) return;
    const current = state.players[state.currentPlayerIndex];
    if (current?.lastRoll !== null) return;
    const [die1, die2] = rollDice();
    dispatch({ type: 'ROLL_START', payload: { die1, die2 } });
    setTimeout(() => dispatch({ type: 'ROLL_END' }), DICE_ANIMATION_MS);
  }, [state.phase, state.isRolling, state.players, state.currentPlayerIndex]);

  const skipTurn = useCallback(() => {
    dispatch({ type: 'SKIP_TURN' });
  }, []);

  const newRound = useCallback(() => {
    dispatch({ type: 'NEW_ROUND' });
  }, []);

  const reset = useCallback((settings?: Partial<GameSettings>) => {
    dispatch({ type: 'RESET', payload: settings });
  }, []);

  const updatePlayerName = useCallback((index: number, name: string) => {
    dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { index, name } });
  }, []);

  const setPlayers = useCallback((players: Player[]) => {
    dispatch({ type: 'SET_PLAYERS', payload: players });
  }, []);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isCurrentPlayerAI = currentPlayer?.isAI ?? false;

  useEffect(() => {
    if (!isCurrentPlayerAI || state.phase !== 'rolling' || state.isRolling) return;
    if (currentPlayer?.lastRoll !== null) return;
    const t = setTimeout(() => roll(), AI_TURN_DELAY_MS);
    return () => clearTimeout(t);
  }, [isCurrentPlayerAI, state.phase, state.isRolling, state.currentPlayerIndex, currentPlayer?.lastRoll, roll]);

  useEffect(() => {
    if (state.settings.thinkingTimeSeconds === 0 || state.phase !== 'rolling' || state.timerRemaining === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (state.timerRemaining === 0) {
      skipTurn();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase, state.timerRemaining, state.settings.thinkingTimeSeconds, skipTurn]);

  return {
    state,
    roll,
    newRound,
    reset,
    updatePlayerName,
    setPlayers,
  };
}
