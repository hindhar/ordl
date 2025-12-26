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
  // Reveal animation props
  isRevealing?: boolean;
  isRevealed?: boolean;
  pendingResult?: boolean | null;
  isDateRevealed?: boolean;
}

export const EventCard = ({
  event,
  index,
  isLocked,
  isCorrect,
  isIncorrect,
  showDate = false,
  isRevealing = false,
  isRevealed = false,
  pendingResult = null,
  isDateRevealed = false,
}: EventCardProps) => {
  const [justLocked, setJustLocked] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const wasLockedRef = useRef(isLocked);
  const wasRevealedRef = useRef(isRevealed);

  // Detect when card becomes locked and trigger animation
  useEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      setJustLocked(true);
      const timer = setTimeout(() => setJustLocked(false), 500);
      return () => clearTimeout(timer);
    }
    wasLockedRef.current = isLocked;
  }, [isLocked]);

  // Trigger flip animation when this card is revealed
  // Skip animation if card was already locked from a previous guess
  useEffect(() => {
    if (isRevealed && !wasRevealedRef.current && !isLocked) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
    wasRevealedRef.current = isRevealed;
  }, [isRevealed, isLocked]);

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

  // Slower transition for rearrangement around locked cards
  // Keep default ease feel, just longer duration (default is ~250ms)
  const slowerTransition = transition
    ? transition.replace(/(\d+)ms/, '400ms')
    : 'transform 400ms ease';

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? 'none' : slowerTransition,
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
        ${isLocked ? 'locked' : ''}
        ${justLocked ? 'just-locked' : ''}
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
        ${isLocked
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
      <div
        className={`
          drag-handle flex-shrink-0 flex flex-col items-center justify-center
          ${isLocked || (isRevealing && isRevealed && pendingResult) ? 'w-6' : 'w-10 h-12 -my-2 -mr-2 rounded-lg'}
          ${!isLocked && !isRevealing ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
        {...(isLocked || isRevealing ? {} : listeners)}
      >
        {isLocked || (isRevealing && isRevealed && pendingResult) ? (
          <svg className="checkmark-icon w-5 h-5 text-correct" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : isRevealing && isRevealed && pendingResult === false ? (
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
    </div>
  );
};
