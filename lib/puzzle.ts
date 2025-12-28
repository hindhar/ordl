import { EVENTS, TOTAL_PUZZLES, EVENTS_PER_PUZZLE, HistoricalEvent } from './events';

// Launch date: December 19, 2025 (backdated so Dec 26 = puzzle #8)
// This gives us puzzles #1-7 as "backlog" in the archive
export const LAUNCH_DATE = new Date('2025-12-19T00:00:00Z').getTime();

// Puzzle changes at 3am UTC each day (same moment globally)
const PUZZLE_CHANGE_HOUR_UTC = 3;

// Get the "puzzle day" by shifting current time back by 3 hours
// This makes 3am UTC the boundary between puzzle days
const getPuzzleDay = (): Date => {
  const now = new Date();
  const shifted = new Date(now.getTime() - PUZZLE_CHANGE_HOUR_UTC * 60 * 60 * 1000);
  return shifted;
};

// Get the puzzle number for today (days since launch)
export const getPuzzleNumber = (): number => {
  const shifted = getPuzzleDay();
  const shiftedDayUTC = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  const dayNumber = Math.floor((shiftedDayUTC - LAUNCH_DATE) / (1000 * 60 * 60 * 24));
  return Math.max(1, dayNumber + 1); // Puzzle numbers start at 1
};

// Alias for clarity - returns today's puzzle number
export const getTodaysPuzzleNumber = getPuzzleNumber;

// Get the maximum puzzle number accessible in the archive
// Users can only access puzzles 1 through (today - 1)
// Today's puzzle is the "live" puzzle and not available in archive
export const getMaxArchivePuzzle = (): number => {
  const todaysPuzzle = getPuzzleNumber();
  return Math.max(0, todaysPuzzle - 1);
};

// Check if a puzzle number is valid for archive access
export const isValidArchivePuzzle = (puzzleNum: number): boolean => {
  const maxArchive = getMaxArchivePuzzle();
  return puzzleNum >= 1 && puzzleNum <= maxArchive;
};

// Get the puzzle index (which set of 5 events to use)
export const getPuzzleIndex = (puzzleNumber: number): number => {
  return (puzzleNumber - 1) % TOTAL_PUZZLES;
};

// Get the 5 events for a specific puzzle
export const getPuzzleEvents = (puzzleNumber: number): HistoricalEvent[] => {
  const puzzleIndex = getPuzzleIndex(puzzleNumber);
  const startIdx = puzzleIndex * EVENTS_PER_PUZZLE;
  return EVENTS.slice(startIdx, startIdx + EVENTS_PER_PUZZLE);
};

// Seeded random number generator for deterministic shuffling
const seededRandom = (seed: number): () => number => {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
};

// Shuffle array with a seed for deterministic results
export const shuffleWithSeed = <T>(array: T[], seed: number): T[] => {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

// Get shuffled events for today's puzzle (same order for all players)
export const getShuffledPuzzleEvents = (puzzleNumber: number): HistoricalEvent[] => {
  const events = getPuzzleEvents(puzzleNumber);
  // Use puzzle number as seed so everyone gets same shuffle
  return shuffleWithSeed(events, puzzleNumber * 31337);
};

// Parse fullDate string (e.g., "March 24, 1989") to timestamp for sorting
const parseFullDate = (fullDate: string): number => {
  const date = new Date(fullDate);
  return date.getTime();
};

// Get the correct order (sorted by full date, oldest first)
export const getCorrectOrder = (events: HistoricalEvent[]): HistoricalEvent[] => {
  return [...events].sort((a, b) => parseFullDate(a.fullDate) - parseFullDate(b.fullDate));
};

// Check if an event is in the correct position
export const isCorrectPosition = (
  events: HistoricalEvent[],
  index: number,
  correctOrder: HistoricalEvent[]
): boolean => {
  return events[index].id === correctOrder[index].id;
};

// Get time until next puzzle (3am UTC)
export const getTimeUntilNextPuzzle = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();

  // Find the next 3am UTC
  const todayAt3am = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    PUZZLE_CHANGE_HOUR_UTC, 0, 0, 0
  ));

  // If we're past 3am today, next puzzle is tomorrow at 3am
  const next3am = now.getTime() >= todayAt3am.getTime()
    ? new Date(todayAt3am.getTime() + 24 * 60 * 60 * 1000)
    : todayAt3am;

  const diff = Math.max(0, next3am.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

// Get today's "puzzle day" date string for storage key
// Uses shifted time so storage aligns with puzzle boundaries
export const getTodayDateString = (): string => {
  const shifted = getPuzzleDay();
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
};
