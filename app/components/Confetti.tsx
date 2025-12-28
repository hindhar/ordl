'use client';

import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  pieceCount?: number;
}

const COLORS = [
  '#2D5A4A', // Forest green (correct)
  '#4A8B73', // Mid green
  '#E8F0EC', // Soft sage
  '#C4553D', // Burnt sienna (for variety)
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
];

/**
 * Confetti celebration component for win states.
 * Shows falling confetti pieces when activated.
 */
export const Confetti = ({
  isActive,
  duration = 3000,
  pieceCount = 50,
}: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // % from left
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5, // 0-0.5s delay
        size: 8 + Math.random() * 8, // 8-16px
        rotation: Math.random() * 360,
      });
    }
    return newPieces;
  }, [pieceCount]);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());
      setIsVisible(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, generatePieces]);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isVisible || prefersReducedMotion) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};
