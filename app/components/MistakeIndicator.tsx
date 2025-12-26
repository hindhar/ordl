'use client';

interface GuessIndicatorProps {
  guessesUsed: number;
  maxGuesses: number;
}

export const MistakeIndicator = ({ guessesUsed, maxGuesses }: GuessIndicatorProps) => {
  const remaining = maxGuesses - guessesUsed;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div className="flex gap-2">
        {Array.from({ length: maxGuesses }).map((_, index) => (
          <div
            key={index}
            className={`guess-pip ${index < guessesUsed ? 'used' : 'available'}`}
            aria-label={index < guessesUsed ? 'Guess used' : 'Guess available'}
          />
        ))}
      </div>
      <span className="text-sm text-text-secondary font-medium">
        {remaining} {remaining === 1 ? 'guess' : 'guesses'} left
      </span>
    </div>
  );
};
