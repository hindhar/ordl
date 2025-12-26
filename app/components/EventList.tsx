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
import { HistoricalEvent } from '@/lib/events';
import { EventCard } from './EventCard';

interface EventListProps {
  events: HistoricalEvent[];
  lockedPositions: number[];
  lastSubmitResults: boolean[] | null;
  status: 'playing' | 'won' | 'lost';
  onReorder: (newEvents: HistoricalEvent[]) => void;
}

export const EventList = ({
  events,
  lockedPositions,
  lastSubmitResults,
  status,
  onReorder,
}: EventListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
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

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Don't allow moving FROM a locked position (shouldn't happen due to disabled, but safety check)
      if (lockedPositions.includes(oldIndex)) {
        return;
      }

      // Don't allow moving TO a locked position
      if (lockedPositions.includes(newIndex)) {
        return;
      }

      // CRITICAL: Don't allow any move that would SHIFT a locked item
      // When moving from oldIndex to newIndex, items in between shift:
      // - If moving down (oldIndex < newIndex): items in [oldIndex+1, newIndex] shift up
      // - If moving up (oldIndex > newIndex): items in [newIndex, oldIndex-1] shift down
      const [shiftStart, shiftEnd] = oldIndex < newIndex
        ? [oldIndex + 1, newIndex]
        : [newIndex, oldIndex - 1];

      const wouldShiftLockedItem = lockedPositions.some(
        pos => pos >= shiftStart && pos <= shiftEnd
      );

      if (wouldShiftLockedItem) {
        return;
      }

      const newOrder = arrayMove(events, oldIndex, newIndex);
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
