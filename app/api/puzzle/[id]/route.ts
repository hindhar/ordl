import { NextRequest, NextResponse } from 'next/server';
import { EVENTS, EVENTS_PER_PUZZLE, TOTAL_PUZZLES, HistoricalEvent } from '@/lib/events';
import { getTodaysPuzzleNumber } from '@/lib/puzzle';

// Shuffle array using Fisher-Yates algorithm with seeded random
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentIndex = result.length;

  // Simple seeded random number generator
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex > 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
  }

  return result;
}

// Get puzzle events in correct order (server-side only)
function getPuzzleEvents(puzzleNumber: number): HistoricalEvent[] {
  const startIndex = (puzzleNumber - 1) * EVENTS_PER_PUZZLE;
  return EVENTS.slice(startIndex, startIndex + EVENTS_PER_PUZZLE);
}

// Get shuffled puzzle events (for client)
function getShuffledPuzzleEvents(puzzleNumber: number): HistoricalEvent[] {
  const events = getPuzzleEvents(puzzleNumber);
  return seededShuffle(events, puzzleNumber * 12345);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const puzzleId = params.id;

  // Handle "today" as a special case
  const todayNum = getTodaysPuzzleNumber();
  const puzzleNumber = puzzleId === 'today' ? todayNum : parseInt(puzzleId, 10);

  // Validate puzzle number
  if (isNaN(puzzleNumber) || puzzleNumber < 1 || puzzleNumber > TOTAL_PUZZLES) {
    return NextResponse.json(
      { error: 'Invalid puzzle number' },
      { status: 400 }
    );
  }

  // Security: Only allow access to today's puzzle and past puzzles
  if (puzzleNumber > todayNum) {
    return NextResponse.json(
      { error: 'This puzzle is not available yet' },
      { status: 403 }
    );
  }

  // Get shuffled events (client won't know correct order)
  const shuffledEvents = getShuffledPuzzleEvents(puzzleNumber);

  // Return puzzle data - NO dates, NO correct order
  return NextResponse.json({
    puzzleNumber,
    todaysPuzzle: todayNum,
    isToday: puzzleNumber === todayNum,
    events: shuffledEvents.map(e => ({
      id: e.id,
      event: e.event,
      emoji: e.emoji,
      // Deliberately NOT sending: year, fullDate
    })),
  });
}
