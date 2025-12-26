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
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { ClientEvent } from '@/hooks/useGame';
import { EventCard } from './EventCard';

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
  // FLIP rearrangement animation
  isAnimatingRearrangement?: boolean;
  preRearrangeOrder?: ClientEvent[] | null;
}

export const EventList = ({
  events,
  lockedPositions,
  lastSubmitResults,
  status,
  onReorder,
  isRevealing = false,
  revealedResultIndex = -1,
  isRevealingDates = false,
  revealedDateIndex = -1,
  pendingResults = null,
  isSolutionRevealing = false,
  solutionColorMap = null,
  isColorTransitioning = false,
  isAnimatingRearrangement = false,
  preRearrangeOrder = null,
}: EventListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // FLIP animation: store positions before rearrangement
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const previousPositions = useRef<Map<string, DOMRect>>(new Map());
  const [flipTransforms, setFlipTransforms] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Capture positions when preRearrangeOrder is set (before the rearrangement)
  useEffect(() => {
    if (preRearrangeOrder && preRearrangeOrder.length > 0) {
      // Store current positions of all cards
      const positions = new Map<string, DOMRect>();
      cardRefs.current.forEach((element, eventId) => {
        positions.set(eventId, element.getBoundingClientRect());
      });
      previousPositions.current = positions;
    }
  }, [preRearrangeOrder]);

  // Apply FLIP animation after DOM updates
  useLayoutEffect(() => {
    if (isAnimatingRearrangement && previousPositions.current.size > 0) {
      // Calculate transforms: where each card needs to animate FROM
      const transforms = new Map<string, { x: number; y: number }>();

      cardRefs.current.forEach((element, eventId) => {
        const previousRect = previousPositions.current.get(eventId);
        const currentRect = element.getBoundingClientRect();

        if (previousRect) {
          // Calculate the delta - how far it moved
          const deltaX = previousRect.left - currentRect.left;
          const deltaY = previousRect.top - currentRect.top;

          if (deltaX !== 0 || deltaY !== 0) {
            transforms.set(eventId, { x: deltaX, y: deltaY });
          }
        }
      });

      setFlipTransforms(transforms);

      // After a frame, trigger the animation by clearing transforms
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipTransforms(new Map());
        });
      });
    }
  }, [isAnimatingRearrangement, events]);

  // Clear transforms when animation ends
  useEffect(() => {
    if (!isAnimatingRearrangement) {
      previousPositions.current.clear();
    }
  }, [isAnimatingRearrangement]);

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

              // Get FLIP transform for this card
              const flipTransform = flipTransforms.get(event.id);
              const flipStyle: React.CSSProperties = flipTransform
                ? {
                    transform: `translate3d(${flipTransform.x}px, ${flipTransform.y}px, 0)`,
                    transition: 'none',
                  }
                : isAnimatingRearrangement && flipTransforms.size === 0
                  ? {
                      transform: 'translate3d(0, 0, 0)',
                      transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  : {};

              return (
                <div
                  key={event.id}
                  ref={(el) => {
                    if (el) {
                      cardRefs.current.set(event.id, el);
                    } else {
                      cardRefs.current.delete(event.id);
                    }
                  }}
                  style={flipStyle}
                  className={isAnimatingRearrangement ? 'flip-rearranging' : ''}
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
