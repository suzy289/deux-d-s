import { useReducer, useCallback, useEffect } from 'react';
import type { GameState, Player, LogEntry, GameSettings } from '../utils/types';
import {
  PLAYER_COLORS,
  DEFAULT_PLAYER_NAMES,
  DEFAULT_MAX_SCORE,
  MIN_PLAYERS,
  MAX_PLAYERS,
  DICE_ANIMATION_MS,
  AI_TURN_DELAY_MS,
} from '../utils/constants';
import { rollDice, processRoll } from '../utils/gameRules';
import { getEventEmoji } from '../utils/gameRules';
import { useAI } from './useAI';

type Action =
  | { type: 'ROLL'; payload: { die1: number; die2: number } }
  | { type: 'ROLL_ANIMATION_START' }
  | { type: 'ROLL_ANIMATION_END' }
  | { type: 'HOLD' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'RESET'; payload?: Partial<GameSettings> }
  | { type: 'UPDATE_PLAYER_NAME'; payload: { index: number; name: string } }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'TRIGGER_LAST_TURN' };

function createInitialPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: DEFAULT_PLAYER_NAMES[i],
    totalScore: 0,
    isActive: i === 0,
    isAI: false,
    color: PLAYER_COLORS[i],
  }));
}

function createInitialState(settings?: Partial<GameSettings>): GameState {
  const playerCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, settings?.playerCount ?? 2));
  return {
    players: createInitialPlayers(playerCount),
    currentTurnScore: 0,
    currentPlayerIndex: 0,
    lastRoll: [0, 0],
    lastEvent: null,
    isRolling: false,
    mustRoll: false,
    gameOver: false,
    winner: null,
    turnNumber: 1,
    log: [],
    settings: {
      maxScore: settings?.maxScore ?? DEFAULT_MAX_SCORE,
      lastTurnMode: settings?.lastTurnMode ?? false,
      playerCount,
    },
    lastTurnTriggered: false,
    lastTurnTriggeredAtPlayerIndex: -1,
  };
}

function addLog(
  log: LogEntry[],
  turnNumber: number,
  player: Player,
  action: LogEntry['action'],
  message: string,
  detail?: string
): LogEntry[] {
  return [
    ...log,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      turnNumber,
      playerName: player.name,
      playerColor: player.color,
      action,
      message,
      detail,
      timestamp: Date.now(),
    },
  ];
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ROLL_ANIMATION_START':
      return { ...state, isRolling: true };

    case 'ROLL': {
      const { die1, die2 } = action.payload;
      const result = processRoll(die1, die2);
      const currentPlayer = state.players[state.currentPlayerIndex];
      let newPlayers = [...state.players];
      let newTurnScore = state.currentTurnScore;
      let newLog = state.log;
      let nextPlayerIndex = state.currentPlayerIndex;
      let newTurnNumber = state.turnNumber;

      if (result.resetTotal) {
        newPlayers = newPlayers.map((p, i) =>
          i === state.currentPlayerIndex ? { ...p, totalScore: 0 } : p
        );
        newLog = addLog(
          newLog,
          state.turnNumber,
          currentPlayer,
          'doublePig',
          'Double 1 ! Perd tout son score.',
          'Score remis à 0'
        );
      }

      if (result.turnEnds) {
        newLog =
          result.event === 'pig'
            ? addLog(
                newLog,
                state.turnNumber,
                currentPlayer,
                'pig',
                `Lance ${die1}+${die2}. Perd le tour.`,
                'Score du tour perdu'
              )
            : newLog;
        nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        newTurnNumber = nextPlayerIndex === 0 ? state.turnNumber + 1 : state.turnNumber;
        newPlayers = newPlayers.map((p, i) => ({
          ...p,
          isActive: i === nextPlayerIndex,
        }));
      } else {
        newTurnScore += result.points;
        newLog = addLog(
          newLog,
          state.turnNumber,
          currentPlayer,
          result.event === 'jackpot' ? 'jackpot' : result.event === 'doubleBonus' ? 'doubleBonus' : 'roll',
          `Lance ${die1}+${die2} = ${die1 + die2}`,
          result.event ? `${getEventEmoji(result.event)} +${result.points} pts tour` : `Score tour: ${newTurnScore}`
        );
      }

      return {
        ...state,
        players: newPlayers,
        currentTurnScore: result.turnEnds ? 0 : newTurnScore,
        currentPlayerIndex: nextPlayerIndex,
        lastRoll: [die1, die2],
        lastEvent: result.event,
        mustRoll: result.mustRoll,
        turnNumber: newTurnNumber,
        log: newLog,
        isRolling: false,
      };
    }

    case 'ROLL_ANIMATION_END':
      return state;

    case 'HOLD': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newTotal = currentPlayer.totalScore + state.currentTurnScore;
      const maxScore = state.settings.maxScore;
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, totalScore: newTotal, isActive: false }
          : { ...p, isActive: (state.currentPlayerIndex + 1) % state.players.length === i }
      );
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      const newTurnNumber = nextIndex === 0 ? state.turnNumber + 1 : state.turnNumber;
      newPlayers[nextIndex].isActive = true;

      const newLog = addLog(
        state.log,
        state.turnNumber,
        currentPlayer,
        'hold',
        `Garde ${state.currentTurnScore} pts. Total: ${newTotal}`,
        `+${state.currentTurnScore} pts`
      );

      let gameOver = false;
      let winner: Player | null = null;
      let lastTurnTriggered = state.lastTurnTriggered;
      let lastTurnTriggeredAtPlayerIndex = state.lastTurnTriggeredAtPlayerIndex;

      if (newTotal >= maxScore && !state.settings.lastTurnMode) {
        gameOver = true;
        winner = { ...currentPlayer, totalScore: newTotal };
      } else if (newTotal >= maxScore && state.settings.lastTurnMode && !state.lastTurnTriggered) {
        lastTurnTriggered = true;
        lastTurnTriggeredAtPlayerIndex = state.currentPlayerIndex;
      } else if (state.lastTurnTriggered && nextIndex === state.lastTurnTriggeredAtPlayerIndex) {
        const maxTotal = Math.max(...newPlayers.map((p) => p.totalScore));
        const best = newPlayers.find((p) => p.totalScore === maxTotal);
        gameOver = true;
        winner = best ?? null;
      }

      return {
        ...state,
        players: newPlayers,
        currentTurnScore: 0,
        currentPlayerIndex: nextIndex,
        lastEvent: null,
        mustRoll: false,
        turnNumber: newTurnNumber,
        log: newLog,
        gameOver,
        winner: gameOver ? winner : null,
        lastTurnTriggered,
        lastTurnTriggeredAtPlayerIndex,
      };
    }

    case 'NEXT_PLAYER':
      return state;

    case 'RESET': {
      const nextSettings = {
        ...state.settings,
        ...action.payload,
      };
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

    case 'TRIGGER_LAST_TURN': {
      const scores = state.players.map((p) => p.totalScore);
      const maxScore = Math.max(...scores);
      const winners = state.players.filter((p) => p.totalScore === maxScore);
      return {
        ...state,
        gameOver: true,
        winner: winners[0] ?? null,
      };
    }

    default:
      return state;
  }
}

export function useGameState(initialSettings?: Partial<GameSettings>) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState(initialSettings));
  const { shouldHold } = useAI();

  const roll = useCallback(() => {
    if (state.gameOver || state.isRolling) return;
    dispatch({ type: 'ROLL_ANIMATION_START' });
    const [die1, die2] = rollDice();
    setTimeout(() => {
      dispatch({ type: 'ROLL', payload: { die1, die2 } });
    }, DICE_ANIMATION_MS);
  }, [state.gameOver, state.isRolling]);

  const hold = useCallback(() => {
    if (state.gameOver || state.mustRoll || state.currentTurnScore === 0) return;
    dispatch({ type: 'HOLD' });
  }, [state.gameOver, state.mustRoll, state.currentTurnScore]);

  const reset = useCallback((settings?: Partial<GameSettings>) => {
    dispatch({ type: 'RESET', payload: settings });
  }, []);

  const updatePlayerName = useCallback((index: number, name: string) => {
    dispatch({ type: 'UPDATE_PLAYER_NAME', payload: { index, name } });
  }, []);

  const setPlayers = useCallback((players: Player[]) => {
    dispatch({ type: 'SET_PLAYERS', payload: players });
  }, []);

  const triggerLastTurn = useCallback(() => {
    dispatch({ type: 'TRIGGER_LAST_TURN' });
  }, []);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isCurrentPlayerAI = currentPlayer?.isAI ?? false;
  const opponentsMaxScore = Math.max(
    ...state.players.filter((_, i) => i !== state.currentPlayerIndex).map((p) => p.totalScore),
    0
  );


  const aiShouldHold = useCallback(() => {
    if (!currentPlayer?.isAI || state.currentTurnScore === 0) return false;
    return shouldHold(
      state.currentTurnScore,
      currentPlayer.totalScore,
      currentPlayer,
      state.settings.maxScore,
      opponentsMaxScore
    );
  }, [currentPlayer, state.currentTurnScore, state.settings.maxScore, opponentsMaxScore, shouldHold]);

  useEffect(() => {
    if (!isCurrentPlayerAI || state.gameOver || state.isRolling || state.mustRoll) return;
    if (state.currentTurnScore > 0 && aiShouldHold()) {
      const t = setTimeout(() => hold(), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
    if (state.currentTurnScore === 0) {
      const t = setTimeout(() => roll(), AI_TURN_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [isCurrentPlayerAI, state.gameOver, state.isRolling, state.mustRoll, state.currentTurnScore, aiShouldHold, hold, roll]);

  return {
    state,
    roll,
    hold,
    reset,
    updatePlayerName,
    setPlayers,
    triggerLastTurn,
    aiShouldHold,
  };
}
