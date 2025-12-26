'use client';

import { GameStats } from '@/lib/storage';
import { StatsDisplay } from './StatsDisplay';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal = ({ isOpen, onClose, stats }: StatsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 bg-text-primary/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-xl border border-border relative">
        {/* Close button - 44px tap target for accessibility */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-neutral"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-text-primary">Statistics</h2>
        </div>

        {/* Stats Display */}
        <StatsDisplay stats={stats} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="btn-primary w-full mt-6 text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};
