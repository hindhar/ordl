'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { Header } from './Header';
import { EventList } from './EventList';
import { MistakeIndicator } from './MistakeIndicator';
import { SubmitButton } from './SubmitButton';
import { ResultModal } from './ResultModal';

const MAX_GUESSES = 4;

interface GameProps {
  initialPuzzle?: number;
}

export const Game = ({ initialPuzzle }: GameProps) => {
  const [modalDismissed, setModalDismissed] = useState(false);

  const {
    puzzleNumber,
    currentOrder,
    lockedPositions,
    attempts,
    mistakes,
    status,
    stats,
    isLoading,
    lastSubmitResults,
    hasChangedSinceLastSubmit,
    isSimulation,
    totalPuzzles,
    reorderEvents,
    submitOrder,
    resetGame,
    loadPuzzle,
    exitSimulation,
  } = useGame(initialPuzzle);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  const isSubmitDisabled =
    status !== 'playing' ||
    (!hasChangedSinceLastSubmit && attempts.length > 0);

  const handlePrevPuzzle = () => {
    const prev = puzzleNumber > 1 ? puzzleNumber - 1 : totalPuzzles;
    loadPuzzle(prev);
  };

  const handleNextPuzzle = () => {
    const next = puzzleNumber < totalPuzzles ? puzzleNumber + 1 : 1;
    loadPuzzle(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header
        puzzleNumber={puzzleNumber}
        isSimulation={isSimulation}
        totalPuzzles={totalPuzzles}
        onPrevPuzzle={handlePrevPuzzle}
        onNextPuzzle={handleNextPuzzle}
        onExitSimulation={exitSimulation}
        onEnterPractice={() => loadPuzzle(1)}
      />

      <main className="flex-grow flex flex-col py-6">
        <EventList
          events={currentOrder}
          lockedPositions={lockedPositions}
          lastSubmitResults={lastSubmitResults}
          status={status}
          onReorder={reorderEvents}
        />

        {status === 'playing' && (
          <>
            {/* Streak display - prominent for motivation */}
            {stats.currentStreak > 0 && (
              <div className="text-center mt-4 mb-2">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                  <span className="text-lg">🔥</span>
                  {stats.currentStreak} day streak
                </span>
              </div>
            )}
            <MistakeIndicator guessesUsed={attempts.length} maxGuesses={MAX_GUESSES} />
            <SubmitButton
              onClick={submitOrder}
              disabled={isSubmitDisabled}
              status={status}
            />
          </>
        )}

        {/* Practice mode button - shown when game is complete */}
        {status !== 'playing' && !isSimulation && (
          <div className="text-center mt-4">
            <button
              onClick={() => loadPuzzle(1)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Practice with other puzzles
            </button>
          </div>
        )}

        {/* Reset button for simulation mode */}
        {isSimulation && status !== 'playing' && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={resetGame}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Try again
            </button>
            <button
              onClick={handleNextPuzzle}
              className="text-sm text-accent hover:underline"
            >
              Next puzzle
            </button>
          </div>
        )}
      </main>

      <ResultModal
        isOpen={status !== 'playing' && !modalDismissed}
        won={status === 'won'}
        puzzleNumber={puzzleNumber}
        attempts={attempts}
        stats={stats}
        isSimulation={isSimulation}
        onClose={() => setModalDismissed(true)}
        onPractice={() => {
          setModalDismissed(true);
          loadPuzzle(1);
        }}
      />
    </div>
  );
};
