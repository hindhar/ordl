'use client';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 bg-text-primary/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-xl border border-border relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors rounded-full hover:bg-neutral"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-text-primary">How to Play</h2>
          <p className="text-text-secondary text-sm mt-1">Order 6 historical events chronologically</p>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium text-text-primary">Drag to reorder</p>
              <p className="text-sm text-text-secondary">
                Arrange events from oldest (top) to newest (bottom)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium text-text-primary">Submit your guess</p>
              <p className="text-sm text-text-secondary">
                You have <span className="font-semibold">4 attempts</span> to get all 6 correct
              </p>
            </div>
          </div>

          {/* Step 3 - Color meaning */}
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium text-text-primary">Check feedback</p>
              <div className="flex gap-6 mt-2">
                <p className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="inline-block w-4 h-4 rounded bg-correct flex-shrink-0"></span>
                  <span>Correct</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="inline-block w-4 h-4 rounded bg-incorrect flex-shrink-0"></span>
                  <span>Wrong</span>
                </p>
              </div>
              {/* Compact inline example */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-text-tertiary">e.g.</span>
                <div className="flex gap-0.5">
                  <span className="w-4 h-4 rounded-sm bg-correct"></span>
                  <span className="w-4 h-4 rounded-sm bg-incorrect"></span>
                  <span className="w-4 h-4 rounded-sm bg-correct"></span>
                  <span className="w-4 h-4 rounded-sm bg-correct"></span>
                  <span className="w-4 h-4 rounded-sm bg-incorrect"></span>
                  <span className="w-4 h-4 rounded-sm bg-correct"></span>
                </div>
                <span className="text-xs text-text-tertiary">= 4/6 correct</span>
              </div>
            </div>
          </div>
        </div>

        {/* New puzzle info */}
        <p className="text-center text-xs text-text-secondary mt-4">
          New puzzle every day at midnight
        </p>

        {/* Play button */}
        <button
          onClick={onClose}
          className="btn-primary w-full mt-6 text-lg"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
