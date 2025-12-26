'use client';

import { useState, useEffect, useCallback } from 'react';
import { HistoricalEvent, TOTAL_PUZZLES, EVENTS_PER_PUZZLE } from '@/lib/events';
import {
  getPuzzleNumber,
  getShuffledPuzzleEvents,
  getCorrectOrder,
  isCorrectPosition,
  getMaxArchivePuzzle,
  isValidArchivePuzzle,
} from '@/lib/puzzle';
import {
  TodayGameState,
  loadTodayGame,
  saveTodayGame,
  updateStatsAfterGame,
  loadStats,
  GameStats,
} from '@/lib/storage';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  puzzleNumber: number;
  events: HistoricalEvent[];
  correctOrder: HistoricalEvent[];
  currentOrder: HistoricalEvent[];
  lockedPositions: number[];
  attempts: boolean[][];
  mistakes: number;
  status: GameStatus;
  stats: GameStats;
  isLoading: boolean;
  lastSubmitResults: boolean[] | null;
  hasChangedSinceLastSubmit: boolean;
  isSimulation: boolean;
  totalPuzzles: number;
  maxArchivePuzzle: number;
}

export interface GameActions {
  reorderEvents: (newOrder: HistoricalEvent[]) => void;
  submitOrder: () => void;
  resetGame: () => void;
  loadPuzzle: (puzzleNum: number) => void;
  exitSimulation: () => void;
}

const MAX_GUESSES = 4;

export const useGame = (initialPuzzle?: number): GameState & GameActions => {
  const [isLoading, setIsLoading] = useState(true);
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [correctOrder, setCorrectOrder] = useState<HistoricalEvent[]>([]);
  const [currentOrder, setCurrentOrder] = useState<HistoricalEvent[]>([]);
  const [lockedPositions, setLockedPositions] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<boolean[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [lastSubmitResults, setLastSubmitResults] = useState<boolean[] | null>(null);
  const [hasChangedSinceLastSubmit, setHasChangedSinceLastSubmit] = useState(true);
  const [isSimulation, setIsSimulation] = useState(false);
  const [realPuzzleNumber, setRealPuzzleNumber] = useState(1);

  // Initialize game on mount
  useEffect(() => {
    const initGame = () => {
      const todayNum = getPuzzleNumber();
      setRealPuzzleNumber(todayNum);

      // If initialPuzzle is provided and different from today, validate and load it in archive mode
      // Security: Only allow access to past puzzles (1 through todayNum - 1)
      if (initialPuzzle && initialPuzzle !== todayNum) {
        // Check if the requested puzzle is a valid archive puzzle
        if (isValidArchivePuzzle(initialPuzzle)) {
          const validPuzzle = initialPuzzle;
          setPuzzleNumber(validPuzzle);
          setIsSimulation(true);

          const puzzleEvents = getShuffledPuzzleEvents(validPuzzle);
          setEvents(puzzleEvents);
          setCorrectOrder(getCorrectOrder(puzzleEvents));
          setCurrentOrder([...puzzleEvents]);
          setLockedPositions([]);
          setAttempts([]);
          setMistakes(0);
          setStatus('playing');
          setLastSubmitResults(null);
          setHasChangedSinceLastSubmit(true);
          setStats(loadStats());
          setIsLoading(false);
          return;
        }
        // Invalid puzzle number (future puzzle or out of range) - fall through to load today's puzzle
      }

      // Otherwise load today's puzzle
      const num = todayNum;
      setPuzzleNumber(num);

      const puzzleEvents = getShuffledPuzzleEvents(num);
      setEvents(puzzleEvents);
      setCorrectOrder(getCorrectOrder(puzzleEvents));

      // Check for saved state
      const savedGame = loadTodayGame(num);

      if (savedGame) {
        // Restore saved state
        const orderMap = new Map(puzzleEvents.map((e) => [e.id, e]));
        const restoredOrder = savedGame.currentOrder
          .map((id) => orderMap.get(id))
          .filter((e): e is HistoricalEvent => e !== undefined);

        setCurrentOrder(restoredOrder);
        setLockedPositions(savedGame.lockedPositions);
        setAttempts(savedGame.attempts);
        setMistakes(savedGame.mistakes);
        setStatus(savedGame.completed ? (savedGame.won ? 'won' : 'lost') : 'playing');
        setHasChangedSinceLastSubmit(false);

        if (savedGame.attempts.length > 0) {
          setLastSubmitResults(savedGame.attempts[savedGame.attempts.length - 1]);
        }
      } else {
        // Fresh game
        setCurrentOrder([...puzzleEvents]);
        setLockedPositions([]);
        setAttempts([]);
        setMistakes(0);
        setStatus('playing');
        setHasChangedSinceLastSubmit(true);
        setLastSubmitResults(null);
      }

      setStats(loadStats());
      setIsLoading(false);
    };

    initGame();
  }, [initialPuzzle]);

  // Save game state whenever it changes (only for real puzzles, not simulations)
  useEffect(() => {
    if (isLoading || currentOrder.length === 0 || isSimulation) return;

    const gameState: TodayGameState = {
      puzzleNumber,
      attempts,
      currentOrder: currentOrder.map((e) => e.id),
      lockedPositions,
      mistakes,
      completed: status !== 'playing',
      won: status === 'won',
    };

    saveTodayGame(gameState);
  }, [puzzleNumber, attempts, currentOrder, lockedPositions, mistakes, status, isLoading, isSimulation]);

  // Reorder events (for drag and drop)
  const reorderEvents = useCallback(
    (newOrder: HistoricalEvent[]) => {
      if (status !== 'playing') return;
      setCurrentOrder(newOrder);
      setHasChangedSinceLastSubmit(true);
    },
    [status]
  );

  // Submit current order
  const submitOrder = useCallback(() => {
    if (status !== 'playing') return;

    // Check each position
    const results = currentOrder.map((_, index) =>
      isCorrectPosition(currentOrder, index, correctOrder)
    );

    // Find ALL correct positions (not just newly correct)
    const correctPositions = results
      .map((correct, index) => ({ correct, index }))
      .filter(({ correct }) => correct)
      .map(({ index }) => index);

    // Check if all correct
    const allCorrect = results.every((r) => r);

    // This is a new guess
    const guessNumber = attempts.length + 1;

    // Update attempts history
    const newAttempts = [...attempts, results];
    setAttempts(newAttempts);
    setLastSubmitResults(results);
    setHasChangedSinceLastSubmit(false);

    // Always lock correct positions immediately
    setLockedPositions(correctPositions);

    if (allCorrect) {
      // Win!
      setStatus('won');
      if (!isSimulation) {
        const newStats = updateStatsAfterGame(true, guessNumber);
        setStats(newStats);
      }
    } else if (guessNumber >= MAX_GUESSES) {
      // Out of guesses - game over
      setStatus('lost');
      if (!isSimulation) {
        const newStats = updateStatsAfterGame(false);
        setStats(newStats);
      }
      // Show correct order
      setCurrentOrder(correctOrder);
      setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
    }
  }, [
    status,
    currentOrder,
    correctOrder,
    attempts,
    isSimulation,
  ]);

  // Reset current puzzle
  const resetGame = useCallback(() => {
    const puzzleEvents = getShuffledPuzzleEvents(puzzleNumber);
    setEvents(puzzleEvents);
    setCorrectOrder(getCorrectOrder(puzzleEvents));
    setCurrentOrder([...puzzleEvents]);
    setLockedPositions([]);
    setAttempts([]);
    setMistakes(0);
    setStatus('playing');
    setLastSubmitResults(null);
    setHasChangedSinceLastSubmit(true);
  }, [puzzleNumber]);

  // Load a specific puzzle (archive mode)
  // Security: Only allow access to past puzzles (1 through maxArchivePuzzle)
  const loadPuzzle = useCallback((puzzleNum: number) => {
    const maxArchive = getMaxArchivePuzzle();

    // Validate the puzzle number is within archive range
    if (puzzleNum < 1 || puzzleNum > maxArchive) {
      // Invalid puzzle number - don't load
      return;
    }

    setPuzzleNumber(puzzleNum);
    setIsSimulation(true);

    const puzzleEvents = getShuffledPuzzleEvents(puzzleNum);
    setEvents(puzzleEvents);
    setCorrectOrder(getCorrectOrder(puzzleEvents));
    setCurrentOrder([...puzzleEvents]);
    setLockedPositions([]);
    setAttempts([]);
    setMistakes(0);
    setStatus('playing');
    setLastSubmitResults(null);
    setHasChangedSinceLastSubmit(true);
  }, []);

  // Exit simulation and return to today's puzzle
  const exitSimulation = useCallback(() => {
    setIsSimulation(false);
    setPuzzleNumber(realPuzzleNumber);

    const puzzleEvents = getShuffledPuzzleEvents(realPuzzleNumber);
    setEvents(puzzleEvents);
    setCorrectOrder(getCorrectOrder(puzzleEvents));

    // Check for saved state
    const savedGame = loadTodayGame(realPuzzleNumber);

    if (savedGame) {
      const orderMap = new Map(puzzleEvents.map((e) => [e.id, e]));
      const restoredOrder = savedGame.currentOrder
        .map((id) => orderMap.get(id))
        .filter((e): e is HistoricalEvent => e !== undefined);

      setCurrentOrder(restoredOrder);
      setLockedPositions(savedGame.lockedPositions);
      setAttempts(savedGame.attempts);
      setMistakes(savedGame.mistakes);
      setStatus(savedGame.completed ? (savedGame.won ? 'won' : 'lost') : 'playing');
      setHasChangedSinceLastSubmit(false);

      if (savedGame.attempts.length > 0) {
        setLastSubmitResults(savedGame.attempts[savedGame.attempts.length - 1]);
      }
    } else {
      setCurrentOrder([...puzzleEvents]);
      setLockedPositions([]);
      setAttempts([]);
      setMistakes(0);
      setStatus('playing');
      setHasChangedSinceLastSubmit(true);
      setLastSubmitResults(null);
    }

    setStats(loadStats());
  }, [realPuzzleNumber]);

  return {
    puzzleNumber,
    events,
    correctOrder,
    currentOrder,
    lockedPositions,
    attempts,
    mistakes,
    status,
    stats,
    isLoading,
    lastSubmitResults,
    hasChangedSinceLastSubmit,
    isSimulation,
    totalPuzzles: TOTAL_PUZZLES,
    maxArchivePuzzle: getMaxArchivePuzzle(),
    reorderEvents,
    submitOrder,
    resetGame,
    loadPuzzle,
    exitSimulation,
  };
};
