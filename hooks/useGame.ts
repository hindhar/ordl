'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TodayGameState,
  loadTodayGame,
  saveTodayGame,
  updateStatsAfterGame,
  loadStats,
  GameStats,
} from '@/lib/storage';

export type GameStatus = 'playing' | 'won' | 'lost';

// Client-side event (no dates until solution is revealed)
export interface ClientEvent {
  id: string;
  event: string;
  emoji: string;
  year?: number;
  fullDate?: string;
}

export interface GameState {
  puzzleNumber: number;
  todaysPuzzle: number;
  events: ClientEvent[];
  currentOrder: ClientEvent[];
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
  reorderEvents: (newOrder: ClientEvent[]) => void;
  submitOrder: () => Promise<void>;
  resetGame: () => void;
  loadPuzzle: (puzzleNum: number) => void;
  exitSimulation: () => void;
}

const MAX_GUESSES = 4;
const EVENTS_PER_PUZZLE = 6;

// Fetch puzzle data from API
async function fetchPuzzle(puzzleId: number | 'today'): Promise<{
  puzzleNumber: number;
  todaysPuzzle: number;
  isToday: boolean;
  events: ClientEvent[];
} | null> {
  try {
    const response = await fetch(`/api/puzzle/${puzzleId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Check order via API
async function checkOrder(puzzleNumber: number, order: string[]): Promise<{
  results: { id: string; correct: boolean; position: number }[];
  allCorrect: boolean;
} | null> {
  try {
    const response = await fetch(`/api/puzzle/${puzzleNumber}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch solution (with dates) from API
async function fetchSolution(puzzleNumber: number): Promise<ClientEvent[] | null> {
  try {
    const response = await fetch(`/api/puzzle/${puzzleNumber}/solution`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.events;
  } catch {
    return null;
  }
}

export const useGame = (initialPuzzle?: number): GameState & GameActions => {
  const [isLoading, setIsLoading] = useState(true);
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [todaysPuzzle, setTodaysPuzzle] = useState(1);
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [currentOrder, setCurrentOrder] = useState<ClientEvent[]>([]);
  const [lockedPositions, setLockedPositions] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<boolean[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [lastSubmitResults, setLastSubmitResults] = useState<boolean[] | null>(null);
  const [hasChangedSinceLastSubmit, setHasChangedSinceLastSubmit] = useState(true);
  const [isSimulation, setIsSimulation] = useState(false);
  const [totalPuzzles, setTotalPuzzles] = useState(70);

  // Calculate max archive puzzle (today - 1)
  const maxArchivePuzzle = Math.max(0, todaysPuzzle - 1);

  // Initialize game on mount
  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);

      // First, fetch today's puzzle to get the current puzzle number
      const todayData = await fetchPuzzle('today');
      if (!todayData) {
        console.error('Failed to fetch today\'s puzzle');
        setIsLoading(false);
        return;
      }

      setTodaysPuzzle(todayData.todaysPuzzle);

      // If initialPuzzle is provided and it's a valid archive puzzle, load it
      if (initialPuzzle && initialPuzzle !== todayData.todaysPuzzle && initialPuzzle >= 1 && initialPuzzle < todayData.todaysPuzzle) {
        const archiveData = await fetchPuzzle(initialPuzzle);
        if (archiveData) {
          setPuzzleNumber(initialPuzzle);
          setIsSimulation(true);
          setEvents(archiveData.events);
          setCurrentOrder([...archiveData.events]);
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
      }

      // Load today's puzzle
      const num = todayData.todaysPuzzle;
      setPuzzleNumber(num);
      setEvents(todayData.events);

      // Check for saved state
      const savedGame = loadTodayGame(num);

      if (savedGame) {
        // Restore saved state
        const orderMap = new Map(todayData.events.map((e) => [e.id, e]));
        const restoredOrder = savedGame.currentOrder
          .map((id) => orderMap.get(id))
          .filter((e): e is ClientEvent => e !== undefined);

        setCurrentOrder(restoredOrder);
        setLockedPositions(savedGame.lockedPositions);
        setAttempts(savedGame.attempts);
        setMistakes(savedGame.mistakes);
        setStatus(savedGame.completed ? (savedGame.won ? 'won' : 'lost') : 'playing');
        setHasChangedSinceLastSubmit(false);

        if (savedGame.attempts.length > 0) {
          setLastSubmitResults(savedGame.attempts[savedGame.attempts.length - 1]);
        }

        // If game is complete, fetch solution to show dates
        if (savedGame.completed) {
          const solution = await fetchSolution(num);
          if (solution) {
            setCurrentOrder(solution);
            setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
          }
        }
      } else {
        // Fresh game
        setCurrentOrder([...todayData.events]);
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
    (newOrder: ClientEvent[]) => {
      if (status !== 'playing') return;
      setCurrentOrder(newOrder);
      setHasChangedSinceLastSubmit(true);
    },
    [status]
  );

  // Submit current order (now async - calls API)
  const submitOrder = useCallback(async () => {
    if (status !== 'playing') return;

    // Call API to check order
    const checkResult = await checkOrder(
      puzzleNumber,
      currentOrder.map(e => e.id)
    );

    if (!checkResult) {
      console.error('Failed to check order');
      return;
    }

    const results = checkResult.results.map(r => r.correct);

    // Find ALL correct positions
    const correctPositions = results
      .map((correct, index) => ({ correct, index }))
      .filter(({ correct }) => correct)
      .map(({ index }) => index);

    // This is a new guess
    const guessNumber = attempts.length + 1;

    // Update attempts history
    const newAttempts = [...attempts, results];
    setAttempts(newAttempts);
    setLastSubmitResults(results);
    setHasChangedSinceLastSubmit(false);

    // Always lock correct positions immediately
    setLockedPositions(correctPositions);

    if (checkResult.allCorrect) {
      // Win! Fetch solution to show dates
      setStatus('won');
      if (!isSimulation) {
        const newStats = updateStatsAfterGame(true, guessNumber);
        setStats(newStats);
      }
      const solution = await fetchSolution(puzzleNumber);
      if (solution) {
        setCurrentOrder(solution);
        setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
      }
    } else if (guessNumber >= MAX_GUESSES) {
      // Out of guesses - game over, fetch solution
      setStatus('lost');
      if (!isSimulation) {
        const newStats = updateStatsAfterGame(false);
        setStats(newStats);
      }
      const solution = await fetchSolution(puzzleNumber);
      if (solution) {
        setCurrentOrder(solution);
        setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
      }
    }
  }, [
    status,
    currentOrder,
    puzzleNumber,
    attempts,
    isSimulation,
  ]);

  // Reset current puzzle
  const resetGame = useCallback(async () => {
    const puzzleData = await fetchPuzzle(puzzleNumber);
    if (!puzzleData) return;

    setEvents(puzzleData.events);
    setCurrentOrder([...puzzleData.events]);
    setLockedPositions([]);
    setAttempts([]);
    setMistakes(0);
    setStatus('playing');
    setLastSubmitResults(null);
    setHasChangedSinceLastSubmit(true);
  }, [puzzleNumber]);

  // Load a specific puzzle (archive mode)
  const loadPuzzle = useCallback(async (puzzleNum: number) => {
    // Validate the puzzle number is within archive range
    if (puzzleNum < 1 || puzzleNum > maxArchivePuzzle) {
      return;
    }

    const puzzleData = await fetchPuzzle(puzzleNum);
    if (!puzzleData) return;

    setPuzzleNumber(puzzleNum);
    setIsSimulation(true);
    setEvents(puzzleData.events);
    setCurrentOrder([...puzzleData.events]);
    setLockedPositions([]);
    setAttempts([]);
    setMistakes(0);
    setStatus('playing');
    setLastSubmitResults(null);
    setHasChangedSinceLastSubmit(true);
  }, [maxArchivePuzzle]);

  // Exit simulation and return to today's puzzle
  const exitSimulation = useCallback(async () => {
    setIsSimulation(false);

    const puzzleData = await fetchPuzzle('today');
    if (!puzzleData) return;

    setPuzzleNumber(puzzleData.puzzleNumber);
    setEvents(puzzleData.events);

    // Check for saved state
    const savedGame = loadTodayGame(puzzleData.puzzleNumber);

    if (savedGame) {
      const orderMap = new Map(puzzleData.events.map((e) => [e.id, e]));
      const restoredOrder = savedGame.currentOrder
        .map((id) => orderMap.get(id))
        .filter((e): e is ClientEvent => e !== undefined);

      setCurrentOrder(restoredOrder);
      setLockedPositions(savedGame.lockedPositions);
      setAttempts(savedGame.attempts);
      setMistakes(savedGame.mistakes);
      setStatus(savedGame.completed ? (savedGame.won ? 'won' : 'lost') : 'playing');
      setHasChangedSinceLastSubmit(false);

      if (savedGame.attempts.length > 0) {
        setLastSubmitResults(savedGame.attempts[savedGame.attempts.length - 1]);
      }

      if (savedGame.completed) {
        const solution = await fetchSolution(puzzleData.puzzleNumber);
        if (solution) {
          setCurrentOrder(solution);
          setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
        }
      }
    } else {
      setCurrentOrder([...puzzleData.events]);
      setLockedPositions([]);
      setAttempts([]);
      setMistakes(0);
      setStatus('playing');
      setHasChangedSinceLastSubmit(true);
      setLastSubmitResults(null);
    }

    setStats(loadStats());
  }, []);

  return {
    puzzleNumber,
    todaysPuzzle,
    events,
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
    totalPuzzles,
    maxArchivePuzzle,
    reorderEvents,
    submitOrder,
    resetGame,
    loadPuzzle,
    exitSimulation,
  };
};
