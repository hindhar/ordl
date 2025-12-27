'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useState, useEffect, useRef } from 'react';
import { ClientEvent } from '@/hooks/useGame';

interface EventCardProps {
  event: ClientEvent;
  index: number;
  isLocked: boolean;
  isCorrect: boolean | null;
  isIncorrect: boolean;
  showDate?: boolean;
  isGameOver?: boolean;
  // Reveal animation props
  isRevealing?: boolean;
  isRevealed?: boolean;
  pendingResult?: boolean | null;
  isDateRevealed?: boolean;
  isSolutionRevealing?: boolean;
  // Hybrid animation props
  isColorTransitioning?: boolean;
  // Rearrangement animation state
  isAnimatingRearrangement?: boolean;
  // Reveal sequence tracking - increments each time a new reveal starts
  revealSequenceId?: number;
  // Positions that were locked when this reveal started (passed from parent)
  lockedAtRevealStart?: number[];
}

export const EventCard = ({
  event,
  index,
  isLocked,
  isCorrect,
  isIncorrect,
  showDate = false,
  isGameOver = false,
  isRevealing = false,
  isRevealed = false,
  pendingResult = null,
  isDateRevealed = false,
  isSolutionRevealing = false,
  isColorTransitioning = false,
  isAnimatingRearrangement = false,
  revealSequenceId = 0,
  lockedAtRevealStart = [],
}: EventCardProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  // Track which reveal sequence we last flipped in (prevents double-flipping)
  const lastFlippedInSequenceRef = useRef(-1);

  // Determine if this card was locked at the start of the current reveal
  // This is passed from the parent (useGame) to ensure consistency
  const wasLockedAtRevealStart = lockedAtRevealStart.includes(index);

  // Trigger flip animation when this card is revealed
  // Rules:
  // 1. First guess: ALL cards flip (lockedAtRevealStart is empty)
  // 2. Second+ guess: Only cards NOT in lockedAtRevealStart flip
  // 3. Never flip during rearrangement animation
  // 4. Only flip once per reveal sequence (tracked by revealSequenceId)
  useEffect(() => {
    // Block flips during rearrangement to prevent extra animations
    if (isAnimatingRearrangement) return;

    // Only flip if:
    // 1. Currently in a reveal sequence
    // 2. This specific card has been revealed
    // 3. We haven't already flipped for this sequence
    // 4. Card was NOT locked when this reveal started
    if (isRevealing && isRevealed &&
        revealSequenceId !== lastFlippedInSequenceRef.current &&
        !wasLockedAtRevealStart) {
      // Mark that we've flipped for this sequence
      lastFlippedInSequenceRef.current = revealSequenceId;
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isRevealing, isRevealed, isAnimatingRearrangement, revealSequenceId, wasLockedAtRevealStart]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: event.id,
    disabled: isLocked,
  });

  // Always disable dnd-kit transitions - they calculate incorrect positions when locked items are present
  // dnd-kit assumes all items can shift, but locked items break this assumption
  // Let React's instant re-render handle position updates correctly
  const effectiveTransition = 'none';

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: effectiveTransition,
    zIndex: isDragging ? 100 : 'auto',
    willChange: isDragging ? 'transform' : 'auto',
  };

  // Determine styling based on state
  let cardClasses = 'bg-bg-secondary border-border shadow-card hover:shadow-card-hover';

  // Already-locked cards (from previous guesses) stay green - skip reveal animation
  if (isLocked && isCorrect) {
    cardClasses = 'bg-correct-bg border-correct-border';
  } else if (isRevealing && pendingResult !== null) {
    // During reveal animation (only for non-locked cards)
    if (isRevealed) {
      // This card has been revealed - show result
      cardClasses = pendingResult
        ? 'bg-correct-bg border-correct-border'
        : 'bg-incorrect-bg border-incorrect';
    } else {
      // Not yet revealed - neutral
      cardClasses = 'bg-bg-secondary border-border';
    }
  } else if (isIncorrect) {
    cardClasses = 'bg-incorrect-bg border-incorrect';
  }

  // Show date when: game is over AND (not revealing dates OR this date has been revealed)
  const shouldShowDate = showDate && (!isRevealing || isDateRevealed);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        event-card
        ${cardClasses}
        ${isLocked && isCorrect ? 'locked' : ''}
        ${isLocked && !isCorrect ? 'locked-incorrect' : ''}
        ${isDragging ? 'dragging' : ''}
        ${isFlipping ? 'card-flip' : ''}
        flex items-center gap-4 p-4 rounded-xl border min-h-[76px]
        select-none
      `}
      {...attributes}
    >
      {/* Position indicator - LEFT */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        text-sm font-display font-semibold transition-colors
        ${isGameOver
          ? (isCorrect ? 'bg-correct text-white' : 'bg-incorrect text-white')
          : isLocked
            ? 'bg-correct text-white'
            : isRevealing && isRevealed && pendingResult !== null
              ? (pendingResult ? 'bg-correct text-white' : 'bg-incorrect text-white')
              : 'bg-neutral border border-border-dark text-text-secondary'}
      `}>
        {index + 1}
      </div>

      {/* Event text */}
      <div className="flex-grow min-w-0 py-0.5">
        <span className="text-text-primary font-medium block leading-snug">
          {event.event}
        </span>
        {shouldShowDate && event.fullDate && (
          <span className={`text-correct text-sm font-semibold mt-0.5 block ${isDateRevealed ? 'date-reveal' : ''}`}>
            {event.fullDate}
          </span>
        )}
      </div>

      {/* Drag handle / Lock indicator - RIGHT */}
      {(() => {
        // Determine what icon to show:
        // 1. During reveal: use pendingResult
        // 2. Game over: use isCorrect/isIncorrect to show final guess result
        // 3. Playing with locked card: checkmark
        // 4. Playing unlocked: drag handle
        let showCheckmark = false;
        let showX = false;

        if (isRevealing && isRevealed && pendingResult !== null) {
          // During flip reveal animation
          showCheckmark = pendingResult === true;
          showX = pendingResult === false;
        } else if (isGameOver) {
          // Final state - show result from final guess
          showCheckmark = isCorrect === true;
          showX = isIncorrect === true;
        } else if (isLocked) {
          // Mid-game locked cards (correct from previous guesses)
          showCheckmark = true;
        }

        const showIcon = showCheckmark || showX;

        return (
          <div
            className={`
              drag-handle flex-shrink-0 flex flex-col items-center justify-center
              ${showIcon ? 'w-6' : 'w-10 h-12 -my-2 -mr-2 rounded-lg'}
              ${!isLocked && !isRevealing ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
            {...(isLocked || isRevealing ? {} : listeners)}
          >
            {showCheckmark ? (
              <svg className="checkmark-icon w-5 h-5 text-correct" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : showX ? (
              <svg className="w-5 h-5 text-incorrect" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="flex flex-col gap-[3px] opacity-40 hover:opacity-70 transition-opacity">
                <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
                <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
                <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
