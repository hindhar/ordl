'use client';

import { useState, createContext, useContext, useCallback, ReactNode } from 'react';

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

interface LiveAnnouncerProviderProps {
  children: ReactNode;
}

/**
 * Provider component for screen reader announcements.
 * Wraps the app and provides an announce function to child components.
 */
export const LiveAnnouncerProvider = ({ children }: LiveAnnouncerProviderProps) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear first to ensure new message is announced even if same text
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
};

/**
 * Hook to access the screen reader announcer.
 */
export const useAnnouncer = (): AnnouncerContextType => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return a no-op if not wrapped in provider
    return { announce: () => {} };
  }
  return context;
};

/**
 * DnD-kit specific announcements for drag and drop operations.
 */
export const useDndAnnouncements = (events: { id: string; event: string }[]) => {
  const { announce } = useAnnouncer();

  const getEventName = useCallback(
    (id: string): string => {
      const event = events.find((e) => e.id === id);
      return event?.event ?? 'Event';
    },
    [events]
  );

  return {
    onDragStart: useCallback(
      (activeId: string) => {
        const eventName = getEventName(activeId);
        announce(`Picked up ${eventName}. Use arrow keys to move, space to drop.`, 'assertive');
      },
      [getEventName, announce]
    ),

    onDragOver: useCallback(
      (activeId: string, overIndex: number) => {
        const eventName = getEventName(activeId);
        announce(`${eventName} is now at position ${overIndex + 1} of 6.`);
      },
      [getEventName, announce]
    ),

    onDragEnd: useCallback(
      (activeId: string, newIndex: number) => {
        const eventName = getEventName(activeId);
        announce(`Dropped ${eventName} at position ${newIndex + 1} of 6.`, 'assertive');
      },
      [getEventName, announce]
    ),

    onDragCancel: useCallback(
      (activeId: string) => {
        const eventName = getEventName(activeId);
        announce(`Cancelled. ${eventName} returned to original position.`, 'assertive');
      },
      [getEventName, announce]
    ),
  };
};

/**
 * Game state announcements.
 */
export const useGameAnnouncements = () => {
  const { announce } = useAnnouncer();

  return {
    announceSubmitResult: useCallback(
      (correctCount: number, total: number) => {
        announce(
          `You got ${correctCount} out of ${total} in the correct position.`,
          'assertive'
        );
      },
      [announce]
    ),

    announceWin: useCallback(
      (attempts: number) => {
        announce(
          `Congratulations! You solved the puzzle in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}!`,
          'assertive'
        );
      },
      [announce]
    ),

    announceLoss: useCallback(() => {
      announce(
        'Game over. The correct order is now shown.',
        'assertive'
      );
    }, [announce]),

    announceGuessesRemaining: useCallback(
      (remaining: number) => {
        if (remaining > 0) {
          announce(`${remaining} ${remaining === 1 ? 'guess' : 'guesses'} remaining.`);
        }
      },
      [announce]
    ),
  };
};
