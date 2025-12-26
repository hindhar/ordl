'use client';

import Link from 'next/link';

interface HeaderProps {
  puzzleNumber: number;
  isSimulation: boolean;
  totalPuzzles: number;
  maxArchivePuzzle: number;
  onPrevPuzzle: () => void;
  onNextPuzzle: () => void;
  onExitSimulation: () => void;
  onShowHelp?: () => void;
  onShowStats?: () => void;
  onShare?: () => void;
}

export const Header = ({
  puzzleNumber,
  isSimulation,
  totalPuzzles,
  maxArchivePuzzle,
  onPrevPuzzle,
  onNextPuzzle,
  onExitSimulation,
  onShowHelp,
  onShowStats,
  onShare,
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
        </div>

        <div className="flex items-center justify-center gap-3 mt-3">
          {isSimulation && (
            <button
              onClick={onPrevPuzzle}
              disabled={puzzleNumber <= 1}
              className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
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
                Archive #{puzzleNumber} of {maxArchivePuzzle}
              </span>
            ) : (
              `Puzzle #${puzzleNumber}`
            )}
          </p>

          {isSimulation && (
            <button
              onClick={onNextPuzzle}
              disabled={puzzleNumber >= maxArchivePuzzle}
              className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next puzzle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {isSimulation && (
          <div className="text-center mt-2">
            <button
              onClick={onExitSimulation}
              className="text-xs text-accent hover:underline"
            >
              Return to today&apos;s puzzle
            </button>
          </div>
        )}

        {/* Persistent action buttons - always visible */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={onShowStats}
            className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="View statistics"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </button>
          <button
            onClick={onShare}
            className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Share results"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>
          <Link
            href="/archive"
            className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Browse puzzle archive"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </Link>
          <button
            onClick={onShowHelp}
            className="w-11 h-11 rounded-full bg-neutral hover:bg-border transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="How to play"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
