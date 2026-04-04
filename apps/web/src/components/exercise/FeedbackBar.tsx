import { useEffect } from 'react';
import { speak } from '../../services/audio';

interface FeedbackBarProps {
  isCorrect: boolean;
  correctAnswer: string;
  onNext: () => void;
  correctAnswerAudio?: string;
  audioEnabled?: boolean;
}

function SmallSpeakerButton({ text, audioEnabled }: { text: string; audioEnabled: boolean }) {
  return (
    <button
      type="button"
      onClick={() => speak(text, audioEnabled)}
      className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 active:scale-90 transition-transform duration-150"
      style={{ background: 'rgba(255,255,255,0.25)' }}
      aria-label="Play pronunciation"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 text-white"
      >
        <path d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.2 1.2 0 0 1-2.05.849L5.1 15.6H2.4A1.2 1.2 0 0 1 1.2 14.4V9.6a1.2 1.2 0 0 1 1.2-1.2h2.7l4.85-4.449a1.2 1.2 0 0 1 1.31-.26ZM15.53 7.47a.75.75 0 0 1 1.06 0 6.75 6.75 0 0 1 0 9.06.75.75 0 0 1-1.06-1.06 5.25 5.25 0 0 0 0-6.94.75.75 0 0 1 0-1.06ZM18.36 4.64a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.983 0 13.79a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.67.75.75 0 0 1 0-1.06Z"/>
      </svg>
    </button>
  );
}

export function FeedbackBar({ isCorrect, correctAnswer, onNext, correctAnswerAudio, audioEnabled = false }: FeedbackBarProps) {
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
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <p className="font-semibold text-[17px] text-white truncate">
          {isCorrect ? 'Correct!' : `Not quite \u2014 ${correctAnswer}`}
        </p>
        {!isCorrect && correctAnswerAudio && audioEnabled && (
          <SmallSpeakerButton text={correctAnswerAudio} audioEnabled={audioEnabled} />
        )}
      </div>
      {!isCorrect && (
        <button
          onClick={onNext}
          className="ml-3 min-h-[44px] min-w-[44px] rounded-[10px] px-5 py-2 text-[15px] font-semibold active:opacity-80 flex-shrink-0"
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
