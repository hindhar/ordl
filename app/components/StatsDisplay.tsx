'use client';

import { GameStats } from '@/lib/storage';

interface StatsDisplayProps {
  stats: GameStats;
  lastGuessCount?: number; // Highlight this row if provided
}

export const StatsDisplay = ({ stats, lastGuessCount }: StatsDisplayProps) => {
  const maxDistribution = Math.max(...stats.guessDistribution, 1);

  return (
    <div className="space-y-3">
      {/* Summary stats - compact single row */}
      <div className="flex justify-center gap-4 py-2 px-3 bg-neutral rounded-lg">
        <div className="text-center">
          <p className="text-lg font-display font-bold text-text-primary">{stats.gamesPlayed}</p>
          <p className="text-[9px] text-text-secondary uppercase tracking-wider">Played</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-correct">
            {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
          </p>
          <p className="text-[9px] text-text-secondary uppercase tracking-wider">Win</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-accent">{stats.currentStreak}</p>
          <p className="text-[9px] text-text-secondary uppercase tracking-wider">Streak</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-text-primary">{stats.maxStreak}</p>
          <p className="text-[9px] text-text-secondary uppercase tracking-wider">Best</p>
        </div>
      </div>

      {/* Guess distribution - compact */}
      <div className="space-y-1">
        <p className="text-[10px] text-text-secondary uppercase tracking-wide text-center">Guess Distribution</p>
        <div className="space-y-0.5">
          {stats.guessDistribution.map((count, index) => {
            const percentage = (count / maxDistribution) * 100;
            const isHighlighted = lastGuessCount === index + 1;

            return (
              <div key={index} className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-text-secondary w-3">{index + 1}</span>
                <div className="flex-grow h-4 bg-neutral rounded overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-end px-1.5 rounded transition-all ${
                      count > 0 ? 'bg-correct' : 'bg-border'
                    }`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className="text-[10px] font-bold text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
