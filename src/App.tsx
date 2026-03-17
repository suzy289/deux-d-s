import { useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { Scoreboard } from './components/Scoreboard';
import { DiceRoller } from './components/DiceRoller';
import { ActionButtons } from './components/ActionButtons';
import { GameLog } from './components/GameLog';
import { SettingsPanel } from './components/SettingsPanel';
import type { GameSettings, Player } from './utils/types';

function App() {
  const { state, roll, newRound, reset, updatePlayerName, setPlayers } = useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNewGame = useCallback(() => {
    reset();
  }, [reset]);

  const handleApplySettings = useCallback(
    (newSettings: Partial<GameSettings>, newPlayers: Player[]) => {
      reset(newSettings);
      setPlayers(newPlayers);
    },
    [reset, setPlayers]
  );

  const currentPlayer = state.players[state.currentPlayerIndex] ?? null;
  const canRoll =
    state.phase === 'rolling' &&
    !state.isRolling &&
    currentPlayer?.lastRoll === null &&
    !currentPlayer?.isAI;

  return (
    <div className="min-h-screen bg-casino-dark text-white font-['Outfit',sans-serif] flex flex-col">
      <header className="flex-shrink-0 h-14 sm:h-16 px-4 flex items-center justify-between bg-casino-dark border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🎲</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">Deux Dés</span>
          </div>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="text-white/80 text-sm sm:text-base">
            Tour n° <strong className="text-casino-accent">{state.roundNumber}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Paramètres
          </button>
          <button
            type="button"
            onClick={handleNewGame}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-casino-accent text-casino-dark hover:bg-casino-accent-hover transition-colors shadow-lg shadow-casino-accent/20"
          >
            Nouvelle partie
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-4 items-center justify-center">
          <section className="relative w-full max-w-2xl rounded-2xl overflow-hidden wood-planks flex flex-col min-h-[440px] sm:min-h-[500px]">
            <div className="relative z-10 flex-shrink-0 p-4 pb-0">
              <Scoreboard
                players={state.players}
                currentPlayerIndex={state.currentPlayerIndex}
                onPlayerNameChange={updatePlayerName}
                editableNames={!currentPlayer?.isAI}
              />
            </div>
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
              <DiceRoller
                currentPlayer={currentPlayer}
                isRolling={state.isRolling}
                roundNumber={state.roundNumber}
                millionRuleTriggered={state.millionRuleTriggered}
                phase={state.phase}
                roundWinners={state.roundWinners}
              />
              <ActionButtons
                onRoll={roll}
                onReplayRound={newRound}
                canRoll={canRoll}
                isRolling={state.isRolling}
                isAiTurn={currentPlayer?.isAI ?? false}
                phase={state.phase}
                timerRemaining={state.timerRemaining}
              />
            </div>
          </section>
          <aside className="w-full lg:w-72 flex-shrink-0">
            <GameLog log={state.log} maxHeight="320px" />
          </aside>
        </div>
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentSettings={state.settings}
        players={state.players}
        onApply={handleApplySettings}
      />
    </div>
  );
}

export default App;
