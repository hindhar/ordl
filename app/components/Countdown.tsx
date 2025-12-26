'use client';

import { useState, useEffect } from 'react';
import { getTimeUntilNextPuzzle } from '@/lib/puzzle';

export const Countdown = () => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      setTime(getTimeUntilNextPuzzle());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="text-center text-text-secondary">
      <p className="text-sm mb-1">Next puzzle in</p>
      <p className="text-2xl font-mono font-semibold text-text-primary">
        {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
      </p>
    </div>
  );
};
