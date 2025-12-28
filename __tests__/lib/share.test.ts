import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateGridRows,
  generateShareText,
  copyToClipboard,
  shareResults,
  ShareData,
} from '@/lib/share';

describe('share.ts', () => {
  describe('generateGridRows', () => {
    it('returns empty array for no attempts', () => {
      expect(generateGridRows([])).toEqual([]);
    });

    it('generates correct grid for single attempt', () => {
      const attempts = [[true, false, true, true, false, true]];
      const rows = generateGridRows(attempts);

      expect(rows).toHaveLength(6);
      expect(rows[0]).toBe('🟩'); // Position 1 correct
      expect(rows[1]).toBe('🟥'); // Position 2 incorrect
      expect(rows[2]).toBe('🟩'); // Position 3 correct
      expect(rows[3]).toBe('🟩'); // Position 4 correct
      expect(rows[4]).toBe('🟥'); // Position 5 incorrect
      expect(rows[5]).toBe('🟩'); // Position 6 correct
    });

    it('generates correct grid for multiple attempts', () => {
      const attempts = [
        [true, false, false, true, false, false],  // Guess 1
        [true, true, false, true, true, false],    // Guess 2
        [true, true, true, true, true, true],      // Guess 3 (win)
      ];
      const rows = generateGridRows(attempts);

      expect(rows).toHaveLength(6);
      // Position 1: correct in all 3 guesses
      expect(rows[0]).toBe('🟩🟩🟩');
      // Position 2: incorrect, then correct, then correct
      expect(rows[1]).toBe('🟥🟩🟩');
      // Position 3: incorrect, incorrect, then correct
      expect(rows[2]).toBe('🟥🟥🟩');
    });

    it('handles all incorrect attempts', () => {
      const attempts = [[false, false, false, false, false, false]];
      const rows = generateGridRows(attempts);

      expect(rows).toHaveLength(6);
      rows.forEach((row) => {
        expect(row).toBe('🟥');
      });
    });

    it('handles all correct attempts', () => {
      const attempts = [[true, true, true, true, true, true]];
      const rows = generateGridRows(attempts);

      expect(rows).toHaveLength(6);
      rows.forEach((row) => {
        expect(row).toBe('🟩');
      });
    });
  });

  describe('generateShareText', () => {
    it('generates correct share text for won game', () => {
      const data: ShareData = {
        puzzleNumber: 8,
        attempts: [[true, true, true, true, true, true]],
        won: true,
        streak: 5,
      };

      const text = generateShareText(data);

      expect(text).toContain('Ordl #8');
      expect(text).toContain('🟩');
      expect(text).toContain('Play Ordl at ordl.io');
      expect(text).not.toContain('Practice');
    });

    it('generates correct share text for lost game', () => {
      const data: ShareData = {
        puzzleNumber: 8,
        attempts: [
          [false, false, false, false, false, false],
          [false, false, false, false, false, false],
          [false, false, false, false, false, false],
          [false, false, false, false, false, false],
        ],
        won: false,
        streak: 0,
      };

      const text = generateShareText(data);

      expect(text).toContain('Ordl #8');
      expect(text).toContain('🟥🟥🟥🟥'); // 4 attempts all wrong
    });

    it('generates correct share text for practice/simulation', () => {
      const data: ShareData = {
        puzzleNumber: 5,
        attempts: [[true, true, true, true, true, true]],
        won: true,
        streak: 0,
        isSimulation: true,
      };

      const text = generateShareText(data);

      expect(text).toContain('Ordl Practice #5');
    });

    it('includes the grid in correct format', () => {
      const data: ShareData = {
        puzzleNumber: 1,
        attempts: [
          [true, false, true, false, true, false],
          [true, true, true, true, true, true],
        ],
        won: true,
        streak: 1,
      };

      const text = generateShareText(data);
      const lines = text.split('\n');

      // Should have: title, blank, 6 grid rows, blank, url
      expect(lines[0]).toBe('Ordl #1');
      expect(lines[1]).toBe('');
      // Grid rows
      expect(lines[2]).toBe('🟩🟩'); // Position 1
      expect(lines[3]).toBe('🟥🟩'); // Position 2
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('uses navigator.clipboard when available', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await copyToClipboard('test text');

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('returns false when clipboard API fails', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Failed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await copyToClipboard('test text');

      expect(result).toBe(false);
    });

    it('uses fallback when clipboard API not available', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Mock document.execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;

      const result = await copyToClipboard('test text');

      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });
  });

  describe('shareResults', () => {
    const mockData: ShareData = {
      puzzleNumber: 8,
      attempts: [[true, true, true, true, true, true]],
      won: true,
      streak: 5,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('tries native share first when available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      const result = await shareResults(mockData);

      expect(mockShare).toHaveBeenCalled();
      expect(result.method).toBe('native');
      expect(result.success).toBe(true);
    });

    it('falls back to clipboard when native share fails', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'));
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await shareResults(mockData);

      expect(result.method).toBe('clipboard');
      expect(result.success).toBe(true);
    });

    it('handles user cancel gracefully', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      const mockShare = vi.fn().mockRejectedValue(abortError);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await shareResults(mockData);

      // Should fall back to clipboard without error
      expect(result.method).toBe('clipboard');
    });

    it('uses clipboard when native share not available', async () => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await shareResults(mockData);

      expect(result.method).toBe('clipboard');
      expect(result.success).toBe(true);
    });
  });
});
