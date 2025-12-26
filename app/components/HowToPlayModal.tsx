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
              <div className="text-sm text-text-secondary space-y-1 mt-1">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-correct flex-shrink-0"></span>
                  <span>= Correct position (locked)</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-incorrect flex-shrink-0"></span>
                  <span>= Wrong position (try again)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="mt-6 p-4 bg-neutral rounded-xl">
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-3 text-center">Example</p>
          <div className="flex justify-center gap-1 text-lg">
            <span>🟩</span>
            <span>🟥</span>
            <span>🟩</span>
            <span>🟩</span>
            <span>🟥</span>
            <span>🟩</span>
          </div>
          <p className="text-xs text-text-secondary text-center mt-2">
            4 events correct, 2 need rearranging
          </p>
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
