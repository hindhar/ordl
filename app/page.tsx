'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Game } from './components/Game';

function GameWithParams() {
  const searchParams = useSearchParams();
  const puzzleParam = searchParams.get('puzzle');
  const initialPuzzle = puzzleParam ? parseInt(puzzleParam, 10) : undefined;

  return <Game initialPuzzle={initialPuzzle} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-primary"><div className="text-text-secondary">Loading...</div></div>}>
      <GameWithParams />
    </Suspense>
  );
}
