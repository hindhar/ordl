'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMaxArchivePuzzle } from '@/lib/puzzle';
import { TOTAL_PUZZLES } from '@/lib/events';

export default function ArchivePage() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  // In dev mode, allow showing all puzzles for testing
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  // Calculate available puzzles using the centralized function
  // This ensures consistency with the game logic
  const maxArchive = getMaxArchivePuzzle();
  const availablePuzzles = (isDev && showAll) ? TOTAL_PUZZLES : maxArchive;

  const handlePuzzleSelect = (puzzleNum: number) => {
    // Navigate to main page with puzzle parameter
    router.push(`/?puzzle=${puzzleNum}`);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="w-full border-b border-border bg-bg-secondary py-4">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-sm text-accent hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Today&apos;s Puzzle
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-center text-text-primary">
            ORDL
          </h1>
          <p className="text-sm text-text-secondary text-center mt-1">
            Puzzle Archive
          </p>
        </div>
      </header>

      {/* Archive grid */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Dev mode toggle */}
        {isDev && (
          <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600">Dev Mode</span>
              <button
                onClick={() => setShowAll(!showAll)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  showAll
                    ? 'bg-yellow-500 text-black'
                    : 'bg-neutral text-text-secondary hover:bg-border'
                }`}
              >
                {showAll ? `All ${TOTAL_PUZZLES} puzzles` : `Past puzzles only (${maxArchive})`}
              </button>
            </div>
          </div>
        )}

        {availablePuzzles === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No past puzzles yet.</p>
            <p className="text-text-secondary text-sm mt-2">Come back tomorrow!</p>
            {isDev && (
              <button
                onClick={() => setShowAll(true)}
                className="inline-block mt-4 text-yellow-500 hover:underline"
              >
                Show all puzzles (dev)
              </button>
            )}
            <Link href="/" className="inline-block mt-4 ml-4 text-accent hover:underline">
              Play today&apos;s puzzle
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4 text-center">
              {isDev && showAll
                ? `All ${availablePuzzles} puzzles (testing mode)`
                : `${availablePuzzles} past puzzle${availablePuzzles !== 1 ? 's' : ''} available`}
            </p>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: availablePuzzles }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handlePuzzleSelect(num)}
                  className="aspect-square rounded-xl bg-bg-secondary border border-border hover:border-accent hover:bg-neutral transition-all flex items-center justify-center text-lg font-medium text-text-primary shadow-sm"
                >
                  {num}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
