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
      className="flex items-center justify-between px-5 py-4 mt-6 rounded-[14px]"
      style={{
        background: isCorrect ? 'var(--ios-green)' : 'var(--ios-red)',
      }}
    >
      <p className="font-semibold text-[17px] text-white">
        {isCorrect ? 'Correct!' : `Not quite \u2014 ${correctAnswer}`}
      </p>
      {!isCorrect && (
        <button
          onClick={onNext}
          className="min-h-[44px] min-w-[44px] rounded-[10px] px-5 py-2 text-[15px] font-semibold active:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.25)',
            color: '#FFFFFF',
          }}
        >
          Next
        </button>
      )}
    </div>
  );
}
