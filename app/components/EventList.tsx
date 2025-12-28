'use client';

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  Announcements,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, useEffect, useMemo } from 'react';
import { ClientEvent } from '@/hooks/useGame';
import { EventCard } from './EventCard';

// Card height including gap (76px min-height + 12px gap)
const CARD_HEIGHT = 88;

interface EventListProps {
  events: ClientEvent[];
  lockedPositions: number[];
  lastSubmitResults: boolean[] | null;
  status: 'playing' | 'won' | 'lost';
  onReorder: (newEvents: ClientEvent[]) => void;
  // Reveal animation props
  isRevealing?: boolean;
  revealedResultIndex?: number;
  isRevealingDates?: boolean;
  revealedDateIndex?: number;
  pendingResults?: boolean[] | null;
  isSolutionRevealing?: boolean;
  // Hybrid animation props
  solutionColorMap?: Map<string, boolean> | null;
  isColorTransitioning?: boolean;
  // Slide rearrangement animation
  isAnimatingRearrangement?: boolean;
  preRearrangeOrder?: ClientEvent[] | null;
  // Previous attempts - used to determine if card should flip
  previousAttempts?: boolean[][];
  // Current guess number (0-indexed, for flip detection)
  currentGuessIndex?: number;
}

export const EventList = ({
  events,
  lockedPositions,
  lastSubmitResults,
  status,
  onReorder,
  isRevealing = false,
  revealedResultIndex = -1,
  isRevealingDates: _isRevealingDates = false,
  revealedDateIndex = -1,
  pendingResults = null,
  isSolutionRevealing = false,
  solutionColorMap = null,
  isColorTransitioning = false,
  isAnimatingRearrangement = false,
  preRearrangeOrder = null,
  previousAttempts = [],
  currentGuessIndex = 0,
}: EventListProps) => {
  const [_activeId, setActiveId] = useState<string | null>(null);

  // Track animation phase: 'offset' = cards at old positions, 'animating' = transitioning to new
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'offset' | 'animating'>('idle');

  // Screen reader announcements for drag-and-drop
  const announcements: Announcements = useMemo(() => {
    const getName = (id: string): string => {
      const event = events.find((e) => e.id === id);
      return event?.event ?? 'Event';
    };

    return {
      onDragStart({ active }) {
        const eventName = getName(active.id as string);
        return `Picked up ${eventName}. Use arrow keys to move, space to drop.`;
      },
      onDragOver({ active, over }) {
        if (over) {
          const eventName = getName(active.id as string);
          const overIndex = events.findIndex((e) => e.id === over.id);
          return `${eventName} is now at position ${overIndex + 1} of 6.`;
        }
        return undefined;
      },
      onDragEnd({ active, over }) {
        if (over) {
          const eventName = getName(active.id as string);
          const newIndex = events.findIndex((e) => e.id === over.id);
          return `Dropped ${eventName} at position ${newIndex + 1} of 6.`;
        }
        const eventName = getName(active.id as string);
        return `${eventName} was dropped.`;
      },
      onDragCancel({ active }) {
        const eventName = getName(active.id as string);
        return `Drag cancelled. ${eventName} returned to original position.`;
      },
    };
  }, [events]);

  // When rearrangement starts, begin at offset phase, then trigger animation
  useEffect(() => {
    if (isAnimatingRearrangement && preRearrangeOrder) {
      // Phase 1: Apply offset to show cards at their old positions
      setAnimationPhase('offset');

      // Phase 2: After a frame, start animating to new positions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationPhase('animating');
        });
      });
    } else {
      setAnimationPhase('idle');
    }
  }, [isAnimatingRearrangement, preRearrangeOrder]);

  // Calculate offset for a card based on index difference
  const getSlideOffset = (eventId: string): number => {
    if (animationPhase !== 'offset' || !preRearrangeOrder) return 0;

    const oldIndex = preRearrangeOrder.findIndex(e => e.id === eventId);
    const newIndex = events.findIndex(e => e.id === eventId);

    if (oldIndex === -1 || newIndex === -1) return 0;

    // Card needs to appear at its OLD position, so offset by difference
    return (oldIndex - newIndex) * CARD_HEIGHT;
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Allow scroll before drag activates
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Custom reorder that keeps locked items fixed and only rearranges unlocked items
  const reorderWithLockedPositions = (
    items: ClientEvent[],
    fromIndex: number,
    toIndex: number,
    locked: number[]
  ): ClientEvent[] => {
    // Get unlocked items with their current positions
    const unlockedWithPositions: { item: ClientEvent; pos: number }[] = [];
    items.forEach((item, index) => {
      if (!locked.includes(index)) {
        unlockedWithPositions.push({ item, pos: index });
      }
    });

    // Find where in the unlocked array the from/to positions are
    const unlockedFromIdx = unlockedWithPositions.findIndex(u => u.pos === fromIndex);
    const unlockedToIdx = unlockedWithPositions.findIndex(u => u.pos === toIndex);

    if (unlockedFromIdx === -1 || unlockedToIdx === -1) return items;

    // Reorder just the unlocked items
    const unlockedItems = unlockedWithPositions.map(u => u.item);
    const reorderedUnlocked = arrayMove(unlockedItems, unlockedFromIdx, unlockedToIdx);

    // Rebuild the full array: locked items stay in place, unlocked slots get reordered items
    const result: ClientEvent[] = [...items];
    let unlockedIdx = 0;
    for (let i = 0; i < result.length; i++) {
      if (!locked.includes(i)) {
        result[i] = reorderedUnlocked[unlockedIdx++];
      }
    }

    return result;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Don't allow moving FROM a locked position
      if (lockedPositions.includes(oldIndex)) {
        return;
      }

      // Don't allow dropping directly ON a locked position
      if (lockedPositions.includes(newIndex)) {
        return;
      }

      // Reorder with locked items staying fixed
      const newOrder = reorderWithLockedPositions(events, oldIndex, newIndex, lockedPositions);
      onReorder(newOrder);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const isGameOver = status !== 'playing';

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* Instructions */}
      <div className="text-center text-sm mb-6">
        {status === 'playing' ? (
          <p className="text-text-secondary">Drag to reorder from oldest to newest</p>
        ) : status === 'won' ? (
          <p className="text-correct font-medium">Correct order!</p>
        ) : (
          <p className="text-incorrect font-medium">The correct order was:</p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: 'To pick up a draggable item, press space or enter. While dragging, use the arrow keys to move the item. Press space or enter again to drop the item in its new position, or press escape to cancel.',
          },
        }}
      >
        <SortableContext
          items={events.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
          disabled={isGameOver}
        >
          {/* Oldest label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Oldest</span>
            <div className="flex-grow h-px bg-border"></div>
          </div>

          <div className="flex flex-col gap-3">
            {events.map((event, index) => {
              const isLocked = lockedPositions.includes(index);

              // Determine card color based on animation state:
              // 1. If solutionColorMap exists, use it (hybrid animation showing original colors after rearrange)
              // 2. Otherwise, use lastSubmitResults
              let isCorrect: boolean | null = null;
              let isIncorrect = false;

              if (solutionColorMap) {
                // During hybrid animation: use color map (by event ID, not position)
                const wasCorrectInGuess = solutionColorMap.get(event.id);
                isCorrect = wasCorrectInGuess ?? null;
                isIncorrect = wasCorrectInGuess === false;
              } else if (lastSubmitResults) {
                // Normal state: use position-based results
                isCorrect = lastSubmitResults[index];
                isIncorrect = !lastSubmitResults[index];
              }

              // Calculate slide animation style
              const slideOffset = getSlideOffset(event.id);
              const slideStyle: React.CSSProperties = animationPhase === 'offset'
                ? {
                    // Offset phase: position cards at their OLD locations (no transition)
                    transform: `translateY(${slideOffset}px)`,
                    transition: 'none',
                  }
                : animationPhase === 'animating'
                  ? {
                      // Animating phase: slide to new positions
                      transform: 'translateY(0)',
                      transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  : {};

              return (
                <div
                  key={event.id}
                  style={slideStyle}
                  className={animationPhase !== 'idle' ? 'slide-rearranging' : ''}
                >
                  <EventCard
                    event={event}
                    index={index}
                    isLocked={isLocked || isGameOver}
                    isCorrect={isCorrect}
                    isIncorrect={isIncorrect}
                    showDate={isGameOver}
                    isGameOver={isGameOver}
                    // Reveal animation props
                    isRevealing={isRevealing}
                    isRevealed={index <= revealedResultIndex}
                    pendingResult={pendingResults ? pendingResults[index] : null}
                    isDateRevealed={index <= revealedDateIndex}
                    isSolutionRevealing={isSolutionRevealing}
                    isColorTransitioning={isColorTransitioning}
                    // Rearrangement animation state
                    isAnimatingRearrangement={isAnimatingRearrangement}
                    // First principles flip logic: pass previous attempts
                    previousAttempts={previousAttempts}
                    currentGuessIndex={currentGuessIndex}
                  />
                </div>
              );
            })}
          </div>

          {/* Newest label */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-grow h-px bg-border"></div>
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Newest</span>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
