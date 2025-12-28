import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadStats,
  saveStats,
  updateStatsAfterGame,
  loadTodayGame,
  saveTodayGame,
  clearTodayGame,
  loadArchiveGame,
  saveArchiveGame,
  GameStats,
  TodayGameState,
} from '@/lib/storage';

// Mock the puzzle module for getTodayDateString
vi.mock('@/lib/puzzle', () => ({
  getTodayDateString: vi.fn(() => '2025-12-26'),
}));

describe('storage.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadStats', () => {
    it('returns default stats when no stats are stored', () => {
      // localStorage is already cleared in beforeEach
      const stats = loadStats();

      expect(stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastPlayedDate: null,
        guessDistribution: [0, 0, 0, 0],
      });
    });

    it('returns stored stats', () => {
      const storedStats: GameStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 2,
        maxStreak: 4,
        lastPlayedDate: '2025-12-25',
        guessDistribution: [1, 1, 1, 0],
      };
      localStorage.setItem('ordl-stats', JSON.stringify(storedStats));

      const stats = loadStats();

      expect(stats).toEqual(storedStats);
    });

    it('migrates old stats without guessDistribution', () => {
      const oldStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 2,
        maxStreak: 4,
        lastPlayedDate: '2025-12-25',
      };
      localStorage.setItem('ordl-stats', JSON.stringify(oldStats));

      const stats = loadStats();

      expect(stats.guessDistribution).toEqual([0, 0, 0, 0]);
    });

    it('resets streak if more than 1 day has passed', () => {
      const storedStats: GameStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 5,
        maxStreak: 5,
        lastPlayedDate: '2025-12-20', // 6 days ago
        guessDistribution: [1, 1, 1, 0],
      };
      localStorage.setItem('ordl-stats', JSON.stringify(storedStats));

      const stats = loadStats();

      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(5); // maxStreak preserved
    });

    it('preserves streak if played yesterday', () => {
      const storedStats: GameStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 5,
        maxStreak: 5,
        lastPlayedDate: '2025-12-25', // Yesterday
        guessDistribution: [1, 1, 1, 0],
      };
      localStorage.setItem('ordl-stats', JSON.stringify(storedStats));

      const stats = loadStats();

      expect(stats.currentStreak).toBe(5);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('ordl-stats', 'not valid json');

      const stats = loadStats();

      expect(stats.gamesPlayed).toBe(0);
    });
  });

  describe('saveStats', () => {
    it('saves stats to localStorage', () => {
      const stats: GameStats = {
        gamesPlayed: 5,
        gamesWon: 3,
        currentStreak: 2,
        maxStreak: 4,
        lastPlayedDate: '2025-12-26',
        guessDistribution: [1, 1, 1, 0],
      };

      saveStats(stats);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ordl-stats',
        JSON.stringify(stats)
      );
    });
  });

  describe('updateStatsAfterGame', () => {
    // localStorage is cleared in global beforeEach

    it('increments gamesPlayed', () => {
      const stats = updateStatsAfterGame(true, 2);
      expect(stats.gamesPlayed).toBe(1);
    });

    it('increments gamesWon and streak on win', () => {
      const stats = updateStatsAfterGame(true, 2);

      expect(stats.gamesWon).toBe(1);
      expect(stats.currentStreak).toBe(1);
      expect(stats.maxStreak).toBe(1);
    });

    it('updates guessDistribution on win', () => {
      const stats = updateStatsAfterGame(true, 2);
      expect(stats.guessDistribution[1]).toBe(1); // Index 1 = 2 guesses
    });

    it('resets streak on loss', () => {
      // Set up existing stats with a streak
      localStorage.setItem('ordl-stats', JSON.stringify({
        gamesPlayed: 1,
        gamesWon: 1,
        currentStreak: 1,
        maxStreak: 1,
        lastPlayedDate: '2025-12-25',
        guessDistribution: [1, 0, 0, 0],
      }));

      const stats = updateStatsAfterGame(false);

      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(1); // Max preserved
    });

    it('updates lastPlayedDate', () => {
      const stats = updateStatsAfterGame(true, 1);
      expect(stats.lastPlayedDate).toBe('2025-12-26');
    });

    it('saves stats after update', () => {
      updateStatsAfterGame(true, 1);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('loadTodayGame', () => {
    it('returns null when no game is stored', () => {
      // localStorage is already cleared in beforeEach
      const game = loadTodayGame(8);

      expect(game).toBeNull();
    });

    it('returns stored game for matching puzzle number', () => {
      const storedGame: TodayGameState = {
        puzzleNumber: 8,
        attempts: [[true, false, true, true, false]],
        currentOrder: ['a', 'b', 'c', 'd', 'e'],
        lockedPositions: [0, 2, 3],
        mistakes: 1,
        completed: false,
        won: false,
      };
      localStorage.setItem('ordl-today', JSON.stringify(storedGame));

      const game = loadTodayGame(8);

      expect(game).toEqual(storedGame);
    });

    it('returns null and clears storage for different puzzle number', () => {
      const storedGame: TodayGameState = {
        puzzleNumber: 7, // Yesterday's puzzle
        attempts: [],
        currentOrder: ['a', 'b', 'c', 'd', 'e'],
        lockedPositions: [],
        mistakes: 0,
        completed: false,
        won: false,
      };
      localStorage.setItem('ordl-today', JSON.stringify(storedGame));

      const game = loadTodayGame(8); // Today's puzzle

      expect(game).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('ordl-today');
    });
  });

  describe('saveTodayGame', () => {
    it('saves game state to localStorage', () => {
      const game: TodayGameState = {
        puzzleNumber: 8,
        attempts: [[true, true, true, true, true]],
        currentOrder: ['a', 'b', 'c', 'd', 'e'],
        lockedPositions: [0, 1, 2, 3, 4],
        mistakes: 0,
        completed: true,
        won: true,
      };

      saveTodayGame(game);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ordl-today',
        JSON.stringify(game)
      );
    });
  });

  describe('clearTodayGame', () => {
    it('removes today game from localStorage', () => {
      clearTodayGame();

      expect(localStorage.removeItem).toHaveBeenCalledWith('ordl-today');
    });
  });

  describe('loadArchiveGame', () => {
    it('returns null when no archive game is stored', () => {
      // localStorage is already cleared in beforeEach
      const game = loadArchiveGame(5);

      expect(game).toBeNull();
    });

    it('returns stored archive game', () => {
      const storedGame: TodayGameState = {
        puzzleNumber: 5,
        attempts: [[true, true, true, true, true]],
        currentOrder: ['a', 'b', 'c', 'd', 'e'],
        lockedPositions: [0, 1, 2, 3, 4],
        mistakes: 0,
        completed: true,
        won: true,
      };
      localStorage.setItem('ordl-archive-5', JSON.stringify(storedGame));

      const game = loadArchiveGame(5);

      expect(game).toEqual(storedGame);
      expect(localStorage.getItem).toHaveBeenCalledWith('ordl-archive-5');
    });
  });

  describe('saveArchiveGame', () => {
    it('saves archive game with correct key', () => {
      const game: TodayGameState = {
        puzzleNumber: 5,
        attempts: [],
        currentOrder: ['a', 'b', 'c', 'd', 'e'],
        lockedPositions: [],
        mistakes: 0,
        completed: false,
        won: false,
      };

      saveArchiveGame(game);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ordl-archive-5',
        JSON.stringify(game)
      );
    });
  });
});
