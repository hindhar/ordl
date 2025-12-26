'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMaxArchivePuzzle } from '@/lib/puzzle';

export default function ArchivePage() {
  const router = useRouter();

  // Get available archive puzzles (1 to today-1)
  const maxArchive = getMaxArchivePuzzle();

  const handlePuzzleSelect = (puzzleNum: number) => {
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
        {maxArchive === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No past puzzles yet.</p>
            <p className="text-text-secondary text-sm mt-2">Come back tomorrow!</p>
            <Link href="/" className="inline-block mt-4 text-accent hover:underline">
              Play today&apos;s puzzle
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4 text-center">
              {maxArchive} past puzzle{maxArchive !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: maxArchive }, (_, i) => i + 1).map((num) => (
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
