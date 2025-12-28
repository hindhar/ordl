'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TodayGameState,
  loadTodayGame,
  saveTodayGame,
  loadArchiveGame,
  saveArchiveGame,
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
  // Reveal animation state
  isRevealing: boolean;
  revealedResultIndex: number; // -1 = none, 0-5 = revealed up to this index
  isRevealingDates: boolean;
  revealedDateIndex: number;
  pendingResults: boolean[] | null;
  // Solution reveal animation (for losing)
  isSolutionRevealing: boolean;
  // Hybrid animation: track original colors by event ID after rearrange
  solutionColorMap: Map<string, boolean> | null; // eventId -> wasCorrectInFinalGuess
  isColorTransitioning: boolean; // triggers fade from original colors to all green
  // FLIP rearrangement animation
  isAnimatingRearrangement: boolean;
  preRearrangeOrder: ClientEvent[] | null; // Order before rearrangement (for FLIP calculation)
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

  // Reveal animation state
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedResultIndex, setRevealedResultIndex] = useState(-1);
  const [isRevealingDates, setIsRevealingDates] = useState(false);
  const [revealedDateIndex, setRevealedDateIndex] = useState(-1);
  const [pendingResults, setPendingResults] = useState<boolean[] | null>(null);
  const [isSolutionRevealing, setIsSolutionRevealing] = useState(false);
  const [solutionColorMap, setSolutionColorMap] = useState<Map<string, boolean> | null>(null);
  const [isColorTransitioning, setIsColorTransitioning] = useState(false);
  const [isAnimatingRearrangement, setIsAnimatingRearrangement] = useState(false);
  const [preRearrangeOrder, setPreRearrangeOrder] = useState<ClientEvent[] | null>(null);

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

          // Check for saved archive state
          const savedArchiveGame = loadArchiveGame(initialPuzzle);

          if (savedArchiveGame) {
            // Restore saved archive state
            const orderMap = new Map(archiveData.events.map((e) => [e.id, e]));
            const restoredOrder = savedArchiveGame.currentOrder
              .map((id) => orderMap.get(id))
              .filter((e): e is ClientEvent => e !== undefined);

            setCurrentOrder(restoredOrder);
            setLockedPositions(savedArchiveGame.lockedPositions);
            setAttempts(savedArchiveGame.attempts);
            setMistakes(savedArchiveGame.mistakes);
            setStatus(savedArchiveGame.completed ? (savedArchiveGame.won ? 'won' : 'lost') : 'playing');
            setHasChangedSinceLastSubmit(false);

            if (savedArchiveGame.attempts.length > 0) {
              setLastSubmitResults(savedArchiveGame.attempts[savedArchiveGame.attempts.length - 1]);
            }

            // If game is complete, fetch solution to show dates
            if (savedArchiveGame.completed) {
              const solution = await fetchSolution(initialPuzzle);
              if (solution) {
                setCurrentOrder(solution);
                setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
              }
            }
          } else {
            // Fresh archive game
            setCurrentOrder([...archiveData.events]);
            setLockedPositions([]);
            setAttempts([]);
            setMistakes(0);
            setStatus('playing');
            setLastSubmitResults(null);
            setHasChangedSinceLastSubmit(true);
          }

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

  // Save game state whenever it changes (both today's puzzle and archive puzzles)
  useEffect(() => {
    if (isLoading || currentOrder.length === 0) return;

    const gameState: TodayGameState = {
      puzzleNumber,
      attempts,
      currentOrder: currentOrder.map((e) => e.id),
      lockedPositions,
      mistakes,
      completed: status !== 'playing',
      won: status === 'won',
    };

    // Save to appropriate storage based on whether it's an archive puzzle
    if (isSimulation) {
      saveArchiveGame(gameState);
    } else {
      saveTodayGame(gameState);
    }
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

  // Helper to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Submit current order (now async - calls API with reveal animation)
  const submitOrder = useCallback(async () => {
    if (status !== 'playing' || isRevealing) return;

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
    const guessNumber = attempts.length + 1;
    const isGameOver = checkResult.allCorrect || guessNumber >= MAX_GUESSES;

    // Store pending results and start reveal animation
    // The flip logic in EventCard now uses the attempts history directly,
    // so we don't need complex snapshot/sequence tracking
    setPendingResults(results);
    setIsRevealing(true);
    setRevealedResultIndex(-1);
    setHasChangedSinceLastSubmit(false);

    // Small delay before starting reveal
    await delay(50);

    // Reveal results one by one (360ms each - 20% slower)
    for (let i = 0; i < EVENTS_PER_PUZZLE; i++) {
      await delay(360);
      setRevealedResultIndex(i);
    }

    // Small pause after all results revealed
    await delay(480);

    // Update attempts history and lock correct positions
    const newAttempts = [...attempts, results];
    setAttempts(newAttempts);
    setLastSubmitResults(results);

    // Clear pending results now that flip reveal is complete
    // This prevents extra flips during subsequent animation phases
    setPendingResults(null);

    const correctPositions = results
      .map((correct, index) => ({ correct, index }))
      .filter(({ correct }) => correct)
      .map(({ index }) => index);

    setLockedPositions(correctPositions);

    // Handle game over
    if (isGameOver) {
      const won = checkResult.allCorrect;
      setStatus(won ? 'won' : 'lost');

      if (!isSimulation) {
        const newStats = updateStatsAfterGame(won, won ? guessNumber : undefined);
        setStats(newStats);
      }

      // Fetch solution and reveal dates one by one
      const solution = await fetchSolution(puzzleNumber);
      if (solution) {
        if (!won) {
          // LOSING ANIMATION SEQUENCE:
          // 1. Pause to let user see their wrong results (already shown via flip)
          await delay(1000);

          // 2. Create color map: remember which events were correct/incorrect
          //    Map eventId -> wasCorrect (so we can show original colors after rearrange)
          const colorMap = new Map<string, boolean>();
          currentOrder.forEach((event, index) => {
            colorMap.set(event.id, results[index]);
          });
          setSolutionColorMap(colorMap);

          // 3. Store current order for FLIP animation calculation
          setPreRearrangeOrder([...currentOrder]);

          // 4. Trigger rearrangement animation and set new order
          //    EventList will use preRearrangeOrder to calculate transforms
          setIsAnimatingRearrangement(true);
          setCurrentOrder(solution);
          setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
          // Clear lastSubmitResults so EventCard uses colorMap instead
          setLastSubmitResults(null);

          // 5. Wait for FLIP animation to complete (800ms)
          await delay(800);
          setIsAnimatingRearrangement(false);
          setPreRearrangeOrder(null);

          // 6. Pause so user can see where their mistakes were in correct order
          await delay(800);

          // Keep solutionColorMap as final state - shows which cards user got right/wrong
          // on their final guess, even though cards are now in correct order
        } else {
          // WON - just set solution immediately (cards already in correct order)
          setCurrentOrder(solution);
          setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
        }

        // Start date reveal animation (480ms each)
        setIsRevealingDates(true);
        setRevealedDateIndex(-1);

        for (let i = 0; i < EVENTS_PER_PUZZLE; i++) {
          await delay(480);
          setRevealedDateIndex(i);
        }

        await delay(360);
        setIsRevealingDates(false);
      }
    }

    // End reveal animation
    setIsRevealing(false);
    setPendingResults(null);
    setRevealedResultIndex(-1);
  }, [
    status,
    currentOrder,
    puzzleNumber,
    attempts,
    isSimulation,
    isRevealing,
  ]);

  // Reset current puzzle
  const resetGame = useCallback(async () => {
    // Reset animation states first
    setIsRevealing(false);
    setRevealedResultIndex(-1);
    setIsRevealingDates(false);
    setRevealedDateIndex(-1);
    setPendingResults(null);
    setIsSolutionRevealing(false);
    setSolutionColorMap(null);
    setIsColorTransitioning(false);
    setIsAnimatingRearrangement(false);
    setPreRearrangeOrder(null);

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

    // Reset animation states first
    setIsRevealing(false);
    setRevealedResultIndex(-1);
    setIsRevealingDates(false);
    setRevealedDateIndex(-1);
    setPendingResults(null);
    setIsSolutionRevealing(false);
    setSolutionColorMap(null);
    setIsColorTransitioning(false);
    setIsAnimatingRearrangement(false);
    setPreRearrangeOrder(null);

    const puzzleData = await fetchPuzzle(puzzleNum);
    if (!puzzleData) return;

    setPuzzleNumber(puzzleNum);
    setIsSimulation(true);
    setEvents(puzzleData.events);

    // Check for saved archive state
    const savedArchiveGame = loadArchiveGame(puzzleNum);

    if (savedArchiveGame) {
      // Restore saved archive state
      const orderMap = new Map(puzzleData.events.map((e) => [e.id, e]));
      const restoredOrder = savedArchiveGame.currentOrder
        .map((id) => orderMap.get(id))
        .filter((e): e is ClientEvent => e !== undefined);

      setCurrentOrder(restoredOrder);
      setLockedPositions(savedArchiveGame.lockedPositions);
      setAttempts(savedArchiveGame.attempts);
      setMistakes(savedArchiveGame.mistakes);
      setStatus(savedArchiveGame.completed ? (savedArchiveGame.won ? 'won' : 'lost') : 'playing');
      setHasChangedSinceLastSubmit(false);

      if (savedArchiveGame.attempts.length > 0) {
        setLastSubmitResults(savedArchiveGame.attempts[savedArchiveGame.attempts.length - 1]);
      }

      // If game is complete, fetch solution to show dates
      if (savedArchiveGame.completed) {
        const solution = await fetchSolution(puzzleNum);
        if (solution) {
          setCurrentOrder(solution);
          setLockedPositions(Array.from({ length: EVENTS_PER_PUZZLE }, (_, i) => i));
        }
      }
    } else {
      // Fresh archive game
      setCurrentOrder([...puzzleData.events]);
      setLockedPositions([]);
      setAttempts([]);
      setMistakes(0);
      setStatus('playing');
      setLastSubmitResults(null);
      setHasChangedSinceLastSubmit(true);
    }
  }, [maxArchivePuzzle]);

  // Exit simulation and return to today's puzzle
  const exitSimulation = useCallback(async () => {
    // Reset animation states first
    setIsRevealing(false);
    setRevealedResultIndex(-1);
    setIsRevealingDates(false);
    setRevealedDateIndex(-1);
    setPendingResults(null);
    setIsSolutionRevealing(false);
    setSolutionColorMap(null);
    setIsColorTransitioning(false);
    setIsAnimatingRearrangement(false);
    setPreRearrangeOrder(null);

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
    // Reveal animation state
    isRevealing,
    revealedResultIndex,
    isRevealingDates,
    revealedDateIndex,
    pendingResults,
    isSolutionRevealing,
    // Hybrid animation state
    solutionColorMap,
    isColorTransitioning,
    // FLIP rearrangement animation
    isAnimatingRearrangement,
    preRearrangeOrder,
    reorderEvents,
    submitOrder,
    resetGame,
    loadPuzzle,
    exitSimulation,
  };
};
