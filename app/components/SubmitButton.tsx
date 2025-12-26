'use client';

interface SubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
  status: 'playing' | 'won' | 'lost';
}

export const SubmitButton = ({ onClick, disabled, status }: SubmitButtonProps) => {
  if (status !== 'playing') {
    return null;
  }

  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onClick}
        disabled={disabled}
        className="btn-primary min-w-[200px] text-lg"
        aria-label="Submit your answer"
      >
        SUBMIT ORDER
      </button>
    </div>
  );
};
