import { getTodayDateString } from './puzzle';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  guessDistribution: [number, number, number, number]; // wins in 1, 2, 3, 4 guesses
}

export interface TodayGameState {
  puzzleNumber: number;
  attempts: boolean[][]; // Each attempt is array of 5 booleans (correct/incorrect per position)
  currentOrder: string[]; // Event IDs in current order
  lockedPositions: number[]; // Indices of locked positions
  mistakes: number;
  completed: boolean;
  won: boolean;
}

const STATS_KEY = 'ordl-stats';
const TODAY_GAME_KEY = 'ordl-today';

// Default stats
const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  guessDistribution: [0, 0, 0, 0],
};

// Load stats from localStorage
export const loadStats = (): GameStats => {
  if (typeof window === 'undefined') return defaultStats;

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return defaultStats;

    const stats = JSON.parse(stored) as GameStats;

    // Migrate old stats without guessDistribution
    if (!stats.guessDistribution) {
      stats.guessDistribution = [0, 0, 0, 0];
    }

    // Check if streak should be reset (missed a day)
    const today = getTodayDateString();
    if (stats.lastPlayedDate) {
      const lastPlayed = new Date(stats.lastPlayedDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If more than 1 day has passed without playing, reset streak
      if (diffDays > 1) {
        stats.currentStreak = 0;
      }
    }

    return stats;
  } catch {
    return defaultStats;
  }
};

// Save stats to localStorage
export const saveStats = (stats: GameStats): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    console.error('Failed to save stats');
  }
};

// Update stats after game completion
export const updateStatsAfterGame = (won: boolean, guessCount?: number): GameStats => {
  const stats = loadStats();
  const today = getTodayDateString();

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

    // Update guess distribution (guessCount is 1-4)
    if (guessCount && guessCount >= 1 && guessCount <= 4) {
      stats.guessDistribution[guessCount - 1] += 1;
    }
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  saveStats(stats);

  return stats;
};

// Load today's game state
export const loadTodayGame = (puzzleNumber: number): TodayGameState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(TODAY_GAME_KEY);
    if (!stored) return null;

    const game = JSON.parse(stored) as TodayGameState;

    // Check if it's for today's puzzle
    if (game.puzzleNumber !== puzzleNumber) {
      // Different puzzle, clear old state
      localStorage.removeItem(TODAY_GAME_KEY);
      return null;
    }

    return game;
  } catch {
    return null;
  }
};

// Save today's game state
export const saveTodayGame = (game: TodayGameState): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TODAY_GAME_KEY, JSON.stringify(game));
  } catch {
    console.error('Failed to save game state');
  }
};

// Clear today's game (for testing)
export const clearTodayGame = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TODAY_GAME_KEY);
};

// Archive puzzle storage - persists progress for each archive puzzle
const ARCHIVE_GAME_KEY_PREFIX = 'ordl-archive-';

// Load archive game state
export const loadArchiveGame = (puzzleNumber: number): TodayGameState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`${ARCHIVE_GAME_KEY_PREFIX}${puzzleNumber}`);
    if (!stored) return null;

    const game = JSON.parse(stored) as TodayGameState;
    return game;
  } catch {
    return null;
  }
};

// Save archive game state
export const saveArchiveGame = (game: TodayGameState): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${ARCHIVE_GAME_KEY_PREFIX}${game.puzzleNumber}`, JSON.stringify(game));
  } catch {
    console.error('Failed to save archive game state');
  }
};
