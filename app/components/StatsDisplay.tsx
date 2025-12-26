'use client';

import { GameStats } from '@/lib/storage';

interface StatsDisplayProps {
  stats: GameStats;
  lastGuessCount?: number; // Highlight this row if provided
}

export const StatsDisplay = ({ stats, lastGuessCount }: StatsDisplayProps) => {
  const maxDistribution = Math.max(...stats.guessDistribution, 1);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex justify-center gap-8 py-4 bg-neutral rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-text-primary">{stats.gamesPlayed}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Played</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-accent">{stats.currentStreak}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-text-primary">{stats.maxStreak}</p>
          <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Best</p>
        </div>
      </div>

      {/* Guess distribution */}
      <div className="space-y-2">
        <p className="text-xs text-text-secondary uppercase tracking-wide text-center">Guess Distribution</p>
        <div className="space-y-1">
          {stats.guessDistribution.map((count, index) => {
            const percentage = (count / maxDistribution) * 100;
            const isHighlighted = lastGuessCount === index + 1;

            return (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-secondary w-3">{index + 1}</span>
                <div className="flex-grow h-5 bg-neutral rounded overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-end px-2 rounded transition-all ${
                      isHighlighted ? 'bg-correct' : 'bg-border'
                    }`}
                    style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className={`text-xs font-bold ${isHighlighted ? 'text-white' : 'text-text-primary'}`}>
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
