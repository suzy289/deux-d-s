import { useState, useCallback, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { Scoreboard } from './components/Scoreboard';
import { DiceRoller } from './components/DiceRoller';
import { ActionButtons } from './components/ActionButtons';
import { GameLog } from './components/GameLog';
import { WinnerModal } from './components/WinnerModal';
import { SettingsPanel } from './components/SettingsPanel';
import type { GameSettings, Player } from './utils/types';

function App() {
  const { state, roll, hold, reset, updatePlayerName, setPlayers } = useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(true);

  useEffect(() => {
    if (state.winner) setShowWinnerModal(true);
  }, [state.winner]);

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

  const hasRolled = state.lastRoll[0] > 0 || state.lastRoll[1] > 0;
  const canRoll =
    !state.gameOver &&
    !state.isRolling &&
    !state.players[state.currentPlayerIndex]?.isAI;
  const canHold =
    !state.gameOver &&
    !state.mustRoll &&
    state.currentTurnScore > 0 &&
    !state.players[state.currentPlayerIndex]?.isAI;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-['Outfit',sans-serif]">
      <header className="border-b border-slate-600/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🎲</span>
            Jeu des Deux Dés
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm sm:text-base">
              Tour n° {state.turnNumber}
            </span>
            {state.lastTurnTriggered && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-medium">
                Dernier tour
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewGame}
              className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors text-sm"
            >
              Nouvelle partie
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors text-sm"
            >
              Paramètres
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <section>
          <Scoreboard
            players={state.players}
            maxScore={state.settings.maxScore}
            currentPlayerIndex={state.currentPlayerIndex}
            currentTurnScore={state.currentTurnScore}
            onPlayerNameChange={updatePlayerName}
            editableNames={!state.players[state.currentPlayerIndex]?.isAI}
          />
        </section>

        <section className="rounded-2xl bg-slate-800/50 border border-slate-600/50 p-6 sm:p-8">
          <DiceRoller
            lastRoll={state.lastRoll}
            currentTurnScore={state.currentTurnScore}
            lastEvent={state.lastEvent}
            isRolling={state.isRolling}
            hasRolled={hasRolled}
          />
          <ActionButtons
            onRoll={roll}
            onHold={hold}
            canRoll={canRoll}
            canHold={canHold}
            isRolling={state.isRolling}
            isAiTurn={state.players[state.currentPlayerIndex]?.isAI ?? false}
          />
        </section>

        <section>
          <GameLog log={state.log} maxHeight="14rem" />
        </section>
      </main>

      {state.winner && showWinnerModal && (
        <WinnerModal
          winner={state.winner}
          onClose={() => setShowWinnerModal(false)}
          onNewGame={() => { setShowWinnerModal(false); handleNewGame(); }}
        />
      )}

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
