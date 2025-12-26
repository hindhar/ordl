import { NextRequest, NextResponse } from 'next/server';
import { EVENTS, EVENTS_PER_PUZZLE, TOTAL_PUZZLES } from '@/lib/events';
import { getTodaysPuzzleNumber } from '@/lib/puzzle';

// Get correct order of event IDs for a puzzle
function getCorrectOrder(puzzleNumber: number): string[] {
  const startIndex = (puzzleNumber - 1) * EVENTS_PER_PUZZLE;
  const events = EVENTS.slice(startIndex, startIndex + EVENTS_PER_PUZZLE);
  return events.map(e => e.id);
}

export async function POST(
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

  // Security: Only allow checking today's puzzle and past puzzles
  if (puzzleNumber > todayNum) {
    return NextResponse.json(
      { error: 'This puzzle is not available yet' },
      { status: 403 }
    );
  }

  // Parse submitted order from request body
  let submittedOrder: string[];
  try {
    const body = await request.json();
    submittedOrder = body.order;

    if (!Array.isArray(submittedOrder) || submittedOrder.length !== EVENTS_PER_PUZZLE) {
      throw new Error('Invalid order format');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Expected { order: string[] }' },
      { status: 400 }
    );
  }

  // Get correct order
  const correctOrder = getCorrectOrder(puzzleNumber);

  // Check each position
  const results = submittedOrder.map((id, index) => ({
    id,
    correct: id === correctOrder[index],
    position: index,
  }));

  // Check if all correct (won)
  const allCorrect = results.every(r => r.correct);

  return NextResponse.json({
    puzzleNumber,
    results,
    allCorrect,
    // Only reveal correct positions, never the full answer
  });
}
