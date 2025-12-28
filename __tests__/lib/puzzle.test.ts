import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPuzzleNumber,
  getTodaysPuzzleNumber,
  getMaxArchivePuzzle,
  isValidArchivePuzzle,
  getPuzzleIndex,
  getPuzzleEvents,
  shuffleWithSeed,
  getShuffledPuzzleEvents,
  getCorrectOrder,
  isCorrectPosition,
  getTimeUntilNextPuzzle,
  getTodayDateString,
  LAUNCH_DATE,
} from '@/lib/puzzle';
import { EVENTS_PER_PUZZLE, TOTAL_PUZZLES } from '@/lib/events';

describe('puzzle.ts', () => {
  describe('getPuzzleNumber', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns puzzle #1 on launch date', () => {
      // Set time to launch date at noon UTC
      vi.setSystemTime(new Date('2025-12-19T12:00:00Z'));
      expect(getPuzzleNumber()).toBe(1);
    });

    it('increments puzzle number each day', () => {
      // Day 2 (Dec 20)
      vi.setSystemTime(new Date('2025-12-20T12:00:00Z'));
      expect(getPuzzleNumber()).toBe(2);

      // Day 8 (Dec 26)
      vi.setSystemTime(new Date('2025-12-26T12:00:00Z'));
      expect(getPuzzleNumber()).toBe(8);
    });

    it('respects 3am UTC puzzle change boundary', () => {
      // Before 3am on Dec 20 - still puzzle 1
      vi.setSystemTime(new Date('2025-12-20T02:59:00Z'));
      expect(getPuzzleNumber()).toBe(1);

      // After 3am on Dec 20 - puzzle 2
      vi.setSystemTime(new Date('2025-12-20T03:01:00Z'));
      expect(getPuzzleNumber()).toBe(2);
    });

    it('never returns a puzzle number less than 1', () => {
      // Before launch date
      vi.setSystemTime(new Date('2025-12-18T12:00:00Z'));
      expect(getPuzzleNumber()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getTodaysPuzzleNumber', () => {
    it('is an alias for getPuzzleNumber', () => {
      expect(getTodaysPuzzleNumber).toBe(getPuzzleNumber);
    });
  });

  describe('getMaxArchivePuzzle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns 0 on day 1 (no archive yet)', () => {
      vi.setSystemTime(new Date('2025-12-19T12:00:00Z'));
      expect(getMaxArchivePuzzle()).toBe(0);
    });

    it('returns previous puzzle numbers for archive', () => {
      vi.setSystemTime(new Date('2025-12-26T12:00:00Z'));
      // Puzzle 8 is today, so archive goes up to 7
      expect(getMaxArchivePuzzle()).toBe(7);
    });
  });

  describe('isValidArchivePuzzle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-26T12:00:00Z')); // Puzzle 8
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for valid archive puzzles', () => {
      expect(isValidArchivePuzzle(1)).toBe(true);
      expect(isValidArchivePuzzle(7)).toBe(true);
    });

    it('returns false for today\'s puzzle', () => {
      expect(isValidArchivePuzzle(8)).toBe(false);
    });

    it('returns false for future puzzles', () => {
      expect(isValidArchivePuzzle(9)).toBe(false);
      expect(isValidArchivePuzzle(100)).toBe(false);
    });

    it('returns false for invalid puzzle numbers', () => {
      expect(isValidArchivePuzzle(0)).toBe(false);
      expect(isValidArchivePuzzle(-1)).toBe(false);
    });
  });

  describe('getPuzzleIndex', () => {
    it('returns correct index for puzzle numbers', () => {
      expect(getPuzzleIndex(1)).toBe(0);
      expect(getPuzzleIndex(2)).toBe(1);
      expect(getPuzzleIndex(TOTAL_PUZZLES)).toBe(TOTAL_PUZZLES - 1);
    });

    it('wraps around after all puzzles are used', () => {
      expect(getPuzzleIndex(TOTAL_PUZZLES + 1)).toBe(0);
      expect(getPuzzleIndex(TOTAL_PUZZLES + 2)).toBe(1);
    });
  });

  describe('getPuzzleEvents', () => {
    it('returns correct number of events', () => {
      const events = getPuzzleEvents(1);
      expect(events).toHaveLength(EVENTS_PER_PUZZLE);
    });

    it('returns different events for different puzzles', () => {
      const events1 = getPuzzleEvents(1);
      const events2 = getPuzzleEvents(2);
      expect(events1[0].id).not.toBe(events2[0].id);
    });

    it('returns events with required properties', () => {
      const events = getPuzzleEvents(1);
      events.forEach((event) => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('event');
        expect(event).toHaveProperty('year');
        expect(event).toHaveProperty('fullDate');
      });
    });
  });

  describe('shuffleWithSeed', () => {
    it('produces deterministic results with same seed', () => {
      const array = [1, 2, 3, 4, 5];
      const result1 = shuffleWithSeed(array, 12345);
      const result2 = shuffleWithSeed(array, 12345);
      expect(result1).toEqual(result2);
    });

    it('produces different results with different seeds', () => {
      const array = [1, 2, 3, 4, 5];
      const result1 = shuffleWithSeed(array, 12345);
      const result2 = shuffleWithSeed(array, 67890);
      expect(result1).not.toEqual(result2);
    });

    it('does not modify the original array', () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      shuffleWithSeed(array, 12345);
      expect(array).toEqual(original);
    });

    it('returns array with same elements', () => {
      const array = [1, 2, 3, 4, 5];
      const result = shuffleWithSeed(array, 12345);
      expect(result.sort()).toEqual(array.sort());
    });
  });

  describe('getShuffledPuzzleEvents', () => {
    it('returns same shuffle for same puzzle number', () => {
      const events1 = getShuffledPuzzleEvents(1);
      const events2 = getShuffledPuzzleEvents(1);
      expect(events1.map((e) => e.id)).toEqual(events2.map((e) => e.id));
    });

    it('returns different shuffle for different puzzle numbers', () => {
      const events1 = getShuffledPuzzleEvents(1);
      const events2 = getShuffledPuzzleEvents(2);
      // Different base events, so definitely different
      expect(events1.map((e) => e.id)).not.toEqual(events2.map((e) => e.id));
    });
  });

  describe('getCorrectOrder', () => {
    it('sorts events by date (oldest first)', () => {
      const events = getPuzzleEvents(1);
      const sorted = getCorrectOrder(events);

      for (let i = 0; i < sorted.length - 1; i++) {
        const date1 = new Date(sorted[i].fullDate).getTime();
        const date2 = new Date(sorted[i + 1].fullDate).getTime();
        expect(date1).toBeLessThanOrEqual(date2);
      }
    });

    it('does not modify the original array', () => {
      const events = getPuzzleEvents(1);
      const originalIds = events.map((e) => e.id);
      getCorrectOrder(events);
      expect(events.map((e) => e.id)).toEqual(originalIds);
    });
  });

  describe('isCorrectPosition', () => {
    it('returns true when event is in correct position', () => {
      const events = getPuzzleEvents(1);
      const correctOrder = getCorrectOrder(events);
      // First event in correct order should be correct at position 0
      expect(isCorrectPosition([correctOrder[0]], 0, correctOrder)).toBe(true);
    });

    it('returns false when event is in wrong position', () => {
      const events = getPuzzleEvents(1);
      const correctOrder = getCorrectOrder(events);
      // Swap first two events
      const wrongOrder = [correctOrder[1], correctOrder[0], ...correctOrder.slice(2)];
      expect(isCorrectPosition(wrongOrder, 0, correctOrder)).toBe(false);
    });
  });

  describe('getTimeUntilNextPuzzle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns time until next 3am UTC', () => {
      // Set time to 2am UTC - should be 1 hour until next puzzle
      vi.setSystemTime(new Date('2025-12-20T02:00:00Z'));
      const time = getTimeUntilNextPuzzle();
      expect(time.hours).toBe(1);
      expect(time.minutes).toBe(0);
      expect(time.seconds).toBe(0);
    });

    it('returns time until next day 3am when past 3am', () => {
      // Set time to 4am UTC - should be 23 hours until next puzzle
      vi.setSystemTime(new Date('2025-12-20T04:00:00Z'));
      const time = getTimeUntilNextPuzzle();
      expect(time.hours).toBe(23);
    });

    it('returns correct minutes and seconds', () => {
      vi.setSystemTime(new Date('2025-12-20T02:30:30Z'));
      const time = getTimeUntilNextPuzzle();
      expect(time.hours).toBe(0);
      expect(time.minutes).toBe(29);
      expect(time.seconds).toBe(30);
    });
  });

  describe('getTodayDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns date string in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2025-12-20T12:00:00Z'));
      const dateStr = getTodayDateString();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('respects 3am UTC boundary', () => {
      // Before 3am on Dec 20 - should return Dec 19
      vi.setSystemTime(new Date('2025-12-20T02:59:00Z'));
      expect(getTodayDateString()).toBe('2025-12-19');

      // After 3am on Dec 20 - should return Dec 20
      vi.setSystemTime(new Date('2025-12-20T03:01:00Z'));
      expect(getTodayDateString()).toBe('2025-12-20');
    });
  });

  describe('LAUNCH_DATE constant', () => {
    it('is December 19, 2025', () => {
      const launchDate = new Date(LAUNCH_DATE);
      expect(launchDate.getUTCFullYear()).toBe(2025);
      expect(launchDate.getUTCMonth()).toBe(11); // December is 11 (0-indexed)
      expect(launchDate.getUTCDate()).toBe(19);
    });
  });
});
