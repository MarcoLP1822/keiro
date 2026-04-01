import { useEffect } from 'react';

interface FeedbackBarProps {
  isCorrect: boolean;
  correctAnswer: string;
  onNext: () => void;
}

export function FeedbackBar({ isCorrect, correctAnswer, onNext }: FeedbackBarProps) {
  useEffect(() => {
    if (!isCorrect) return;
    const timer = setTimeout(onNext, 1500);
    return () => clearTimeout(timer);
  }, [isCorrect, onNext]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 rounded-xl p-4 flex items-center justify-between ${
        isCorrect
          ? 'bg-success/10 text-success'
          : 'bg-error/10 text-error'
      }`}
    >
      <p className="font-semibold text-base">
        {isCorrect ? 'Correct!' : `Not quite \u2014 ${correctAnswer}`}
      </p>
      {!isCorrect && (
        <button
          onClick={onNext}
          className="min-h-[44px] min-w-[44px] rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white active:opacity-80"
        >
          Next
        </button>
      )}
    </div>
  );
}
