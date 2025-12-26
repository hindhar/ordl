'use client';

import Link from 'next/link';

interface HeaderProps {
  puzzleNumber: number;
  isSimulation: boolean;
  totalPuzzles: number;
  onPrevPuzzle: () => void;
  onNextPuzzle: () => void;
  onExitSimulation: () => void;
  onEnterPractice: () => void;
}

export const Header = ({
  puzzleNumber,
  isSimulation,
  totalPuzzles,
  onPrevPuzzle,
  onNextPuzzle,
  onExitSimulation,
  onEnterPractice,
}: HeaderProps) => {
  return (
    <header className="w-full border-b border-border bg-bg-secondary py-6">
      <div className="max-w-lg mx-auto px-4">
        {/* Distinctive masthead */}
        <div className="text-center mb-1">
          <h1 className="masthead text-5xl md:text-6xl font-display font-bold tracking-tight text-text-primary">
            <span className="masthead-letter">O</span>
            <span className="masthead-letter">R</span>
            <span className="masthead-letter">D</span>
            <span className="masthead-letter">L</span>
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-text-secondary mt-1 font-medium">
            Order History Daily
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-3">
          {isSimulation && (
            <button
              onClick={onPrevPuzzle}
              className="w-8 h-8 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary"
              aria-label="Previous puzzle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <p className="text-sm text-text-secondary">
            {isSimulation ? (
              <span className="text-accent font-medium">
                Practice #{puzzleNumber} of {totalPuzzles}
              </span>
            ) : (
              `Puzzle #${puzzleNumber}`
            )}
          </p>

          {isSimulation && (
            <button
              onClick={onNextPuzzle}
              className="w-8 h-8 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary"
              aria-label="Next puzzle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {isSimulation ? (
          <div className="text-center mt-2">
            <button
              onClick={onExitSimulation}
              className="text-xs text-accent hover:underline"
            >
              Return to today&apos;s puzzle
            </button>
          </div>
        ) : (
          <div className="text-center mt-2">
            <Link
              href="/archive"
              className="text-xs text-text-secondary hover:text-accent transition-colors"
            >
              Archive
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
