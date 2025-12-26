import { NextRequest, NextResponse } from 'next/server';
import { EVENTS, EVENTS_PER_PUZZLE, TOTAL_PUZZLES } from '@/lib/events';
import { getTodaysPuzzleNumber } from '@/lib/puzzle';

export async function GET(
  request: NextRequest,
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

  // Security: Only allow solution for today's puzzle and past puzzles
  if (puzzleNumber > todayNum) {
    return NextResponse.json(
      { error: 'This puzzle is not available yet' },
      { status: 403 }
    );
  }

  // Get the events in correct chronological order (with full details)
  const startIndex = (puzzleNumber - 1) * EVENTS_PER_PUZZLE;
  const events = EVENTS.slice(startIndex, startIndex + EVENTS_PER_PUZZLE);

  // Return full solution with dates
  return NextResponse.json({
    puzzleNumber,
    events: events.map(e => ({
      id: e.id,
      event: e.event,
      emoji: e.emoji,
      year: e.year,
      fullDate: e.fullDate,
    })),
  });
}
