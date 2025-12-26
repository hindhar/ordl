'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { HistoricalEvent } from '@/lib/events';

interface EventCardProps {
  event: HistoricalEvent;
  index: number;
  isLocked: boolean;
  isCorrect: boolean | null;
  isIncorrect: boolean;
  showDate?: boolean;
}

export const EventCard = ({
  event,
  index,
  isLocked,
  isCorrect,
  isIncorrect,
  showDate = false,
}: EventCardProps) => {
  const [justLocked, setJustLocked] = useState(false);
  const wasLockedRef = useRef(isLocked);

  // Detect when card becomes locked and trigger animation
  useEffect(() => {
    if (isLocked && !wasLockedRef.current) {
      setJustLocked(true);
      const timer = setTimeout(() => setJustLocked(false), 500);
      return () => clearTimeout(timer);
    }
    wasLockedRef.current = isLocked;
  }, [isLocked]);

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  // Determine styling based on state
  let cardClasses = 'bg-bg-secondary border-border shadow-card hover:shadow-card-hover';

  if (isLocked && isCorrect) {
    cardClasses = 'bg-correct-bg border-correct-border';
  } else if (isIncorrect) {
    cardClasses = 'bg-incorrect-bg border-incorrect';
  }

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
        flex items-center gap-4 p-4 rounded-xl border
        ${!isLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        select-none
      `}
      {...attributes}
      {...listeners}
    >
      {/* Position indicator - LEFT */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
        text-sm font-display font-semibold transition-colors
        ${isLocked ? 'bg-correct text-white' : 'bg-neutral border border-border-dark text-text-secondary'}
      `}>
        {index + 1}
      </div>

      {/* Event text */}
      <div className="flex-grow min-w-0 py-0.5">
        <span className="text-text-primary font-medium block leading-snug">
          {event.event}
        </span>
        {showDate && (
          <span className="text-correct text-sm font-semibold mt-0.5 block">
            {event.fullDate}
          </span>
        )}
      </div>

      {/* Drag handle / Lock indicator - RIGHT */}
      <div className="flex-shrink-0 w-6 flex flex-col items-center justify-center">
        {isLocked ? (
          <svg className="checkmark-icon w-5 h-5 text-correct" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="flex flex-col gap-[3px] opacity-60 group-hover:opacity-80 transition-opacity">
            <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
            <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
            <div className="w-5 h-[2px] bg-text-secondary rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};
