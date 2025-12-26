'use client';

import { useState } from 'react';
import { GameStats } from '@/lib/storage';
import { generateShareText, generateGridRows, copyToClipboard } from '@/lib/share';
import { StatsDisplay } from './StatsDisplay';
import { Countdown } from './Countdown';

interface ResultModalProps {
  isOpen: boolean;
  won: boolean;
  puzzleNumber: number;
  attempts: boolean[][];
  stats: GameStats;
  isSimulation?: boolean;
  onClose: () => void;
  onPractice: () => void;
}

export const ResultModal = ({
  isOpen,
  won,
  puzzleNumber,
  attempts,
  stats,
  isSimulation = false,
  onClose,
  onPractice,
}: ResultModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    const shareText = generateShareText({
      puzzleNumber,
      attempts,
      won,
      streak: stats.currentStreak,
      isSimulation,
    });

    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate Wordle-style grid: each row = one guess, each column = one position
  const gridRows = generateGridRows(attempts);

  // Score format like Wordle
  const score = won ? `${attempts.length}/4` : 'X/4';

  return (
    <div className="modal-backdrop fixed inset-0 bg-text-primary/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-xl border border-border relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Result header with score */}
        <div className="text-center mb-6">
          <h2 className={`text-3xl font-display font-bold tracking-tight ${won ? 'text-correct' : 'text-incorrect'}`}>
            {won ? 'Brilliant!' : 'So Close!'}
          </h2>
          <p className="text-4xl font-display font-bold text-text-primary mt-3">{score}</p>
          <p className="text-text-secondary mt-2 text-sm">
            {won
              ? `Solved in ${attempts.length} attempt${attempts.length === 1 ? '' : 's'}`
              : 'Better luck tomorrow'}
          </p>
        </div>

        {/* Stats */}
        <StatsDisplay stats={stats} lastGuessCount={won ? attempts.length : undefined} />

        {/* Wordle-style grid: each row = one guess, each column = one position */}
        <div className="share-grid text-center py-4 text-2xl leading-relaxed font-mono">
          {gridRows.map((row, i) => (
            <div key={i} className="tracking-wider">{row}</div>
          ))}
        </div>

        {/* Share button */}
        <div className="flex justify-center py-4">
          <button
            onClick={handleShare}
            className="btn-primary min-w-[200px] text-lg flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share Result</span>
              </>
            )}
          </button>
        </div>

        {/* Countdown */}
        <div className="pt-4 border-t border-border">
          <Countdown />
        </div>

        {/* Practice button */}
        <div className="text-center mt-4">
          <button
            onClick={onPractice}
            className="text-sm text-accent hover:underline"
          >
            Practice with other puzzles
          </button>
        </div>
      </div>
    </div>
  );
};
