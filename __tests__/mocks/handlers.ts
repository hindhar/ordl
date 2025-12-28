import { http, HttpResponse } from 'msw';
import { getPuzzleEvents, getShuffledPuzzleEvents } from '@/lib/puzzle';

// Mock puzzle data for testing
export const createMockPuzzleResponse = (puzzleNumber: number) => {
  const events = getShuffledPuzzleEvents(puzzleNumber);
  return {
    puzzleNumber,
    todaysPuzzle: puzzleNumber,
    events: events.map((event) => ({
      id: event.id,
      event: event.event,
      emoji: event.emoji,
      // Note: year and fullDate are intentionally omitted for security
    })),
  };
};

export const handlers = [
  // GET /api/puzzle/:id - Fetch puzzle data
  http.get('/api/puzzle/:id', ({ params }) => {
    const puzzleNumber = parseInt(params.id as string, 10);

    if (isNaN(puzzleNumber) || puzzleNumber < 1) {
      return HttpResponse.json(
        { error: 'Invalid puzzle number' },
        { status: 400 }
      );
    }

    return HttpResponse.json(createMockPuzzleResponse(puzzleNumber));
  }),

  // POST /api/puzzle/:id/check - Check puzzle answer
  http.post('/api/puzzle/:id/check', async ({ params, request }) => {
    const puzzleNumber = parseInt(params.id as string, 10);

    if (isNaN(puzzleNumber) || puzzleNumber < 1) {
      return HttpResponse.json(
        { error: 'Invalid puzzle number' },
        { status: 400 }
      );
    }

    const body = await request.json() as { order: string[] };
    const { order } = body;

    if (!order || !Array.isArray(order)) {
      return HttpResponse.json(
        { error: 'Invalid order format' },
        { status: 400 }
      );
    }

    const events = getPuzzleEvents(puzzleNumber);
    const correctOrder = [...events].sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

    const results = order.map((id, index) => id === correctOrder[index].id);
    const allCorrect = results.every((r) => r);

    return HttpResponse.json({
      results,
      allCorrect,
      // Only reveal dates if all correct or game over (handled client-side)
    });
  }),
];

export const errorHandlers = [
  // Simulate network error
  http.get('/api/puzzle/:id', () => {
    return HttpResponse.error();
  }),

  // Simulate server error
  http.get('/api/puzzle/:id', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),
];
