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
import { useState } from 'react';
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
}: EventListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

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
              const isCorrect = lastSubmitResults ? lastSubmitResults[index] : null;
              const isIncorrect = lastSubmitResults ? !lastSubmitResults[index] && !isLocked : false;

              return (
                <EventCard
                  key={event.id}
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
                />
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
