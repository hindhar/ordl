'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { Header } from './Header';
import { EventList } from './EventList';
import { MistakeIndicator } from './MistakeIndicator';
import { SubmitButton } from './SubmitButton';
import { ResultModal } from './ResultModal';
import { HowToPlayModal } from './HowToPlayModal';
import { StatsModal } from './StatsModal';
import { shareResults } from '@/lib/share';

const MAX_GUESSES = 4;

interface GameProps {
  initialPuzzle?: number;
}

const ONBOARDING_KEY = 'ordl-onboarding-seen';

export const Game = ({ initialPuzzle }: GameProps) => {
  const [modalDismissed, setModalDismissed] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Show onboarding modal for first-time users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowHowToPlay(true);
    }
  }, []);

  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleShare = async () => {
    if (status === 'playing') return; // Only share when game is complete
    await shareResults({
      puzzleNumber,
      attempts,
      won: status === 'won',
      streak: stats.currentStreak,
      isSimulation,
    });
  };

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
    maxArchivePuzzle,
    // Reveal animation state
    isRevealing,
    revealedResultIndex,
    isRevealingDates,
    revealedDateIndex,
    pendingResults,
    isSolutionRevealing,
    // Hybrid animation state
    solutionColorMap,
    isColorTransitioning,
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
    isRevealing ||
    (!hasChangedSinceLastSubmit && attempts.length > 0);

  const handlePrevPuzzle = () => {
    // Only navigate within archive range (1 to maxArchivePuzzle)
    if (puzzleNumber > 1) {
      loadPuzzle(puzzleNumber - 1);
    }
  };

  const handleNextPuzzle = () => {
    // Only navigate within archive range (1 to maxArchivePuzzle)
    if (puzzleNumber < maxArchivePuzzle) {
      loadPuzzle(puzzleNumber + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header
        puzzleNumber={puzzleNumber}
        isSimulation={isSimulation}
        totalPuzzles={totalPuzzles}
        maxArchivePuzzle={maxArchivePuzzle}
        onPrevPuzzle={handlePrevPuzzle}
        onNextPuzzle={handleNextPuzzle}
        onExitSimulation={exitSimulation}
        onShowHelp={() => setShowHowToPlay(true)}
        onShowStats={() => setShowStats(true)}
        onShare={handleShare}
      />

      <main className="flex-grow flex flex-col py-6">
        <EventList
          events={currentOrder}
          lockedPositions={lockedPositions}
          lastSubmitResults={lastSubmitResults}
          status={status}
          onReorder={reorderEvents}
          isRevealing={isRevealing}
          revealedResultIndex={revealedResultIndex}
          isRevealingDates={isRevealingDates}
          revealedDateIndex={revealedDateIndex}
          pendingResults={pendingResults}
          isSolutionRevealing={isSolutionRevealing}
          solutionColorMap={solutionColorMap}
          isColorTransitioning={isColorTransitioning}
        />

        {status === 'playing' && (
          <>
            <SubmitButton
              onClick={submitOrder}
              disabled={isSubmitDisabled}
              status={status}
            />
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
          </>
        )}

        {/* Archive mode button - shown when game is complete and there are archive puzzles */}
        {status !== 'playing' && !isSimulation && maxArchivePuzzle > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => loadPuzzle(1)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Browse the archive
            </button>
          </div>
        )}

        {/* Reset button for archive mode */}
        {isSimulation && status !== 'playing' && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={resetGame}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Try again
            </button>
            {puzzleNumber < maxArchivePuzzle && (
              <button
                onClick={handleNextPuzzle}
                className="text-sm text-accent hover:underline"
              >
                Next puzzle
              </button>
            )}
          </div>
        )}
      </main>

      <ResultModal
        isOpen={status !== 'playing' && !modalDismissed && !isRevealing}
        won={status === 'won'}
        puzzleNumber={puzzleNumber}
        attempts={attempts}
        stats={stats}
        isSimulation={isSimulation}
        maxArchivePuzzle={maxArchivePuzzle}
        onClose={() => setModalDismissed(true)}
        onPractice={() => {
          setModalDismissed(true);
          loadPuzzle(1);
        }}
      />

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={handleCloseHowToPlay}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />
    </div>
  );
};
