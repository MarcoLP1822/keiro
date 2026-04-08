import { speak } from '../../services/audio';

interface FeedbackBarProps {
  isCorrect: boolean;
  correctAnswer: string;
  onNext: () => void;
  correctAnswerAudio?: string;
  audioEnabled?: boolean;
}

export function FeedbackBar({ isCorrect, correctAnswer, onNext, correctAnswerAudio, audioEnabled = false }: FeedbackBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-6"
      style={{
        background: isCorrect ? 'var(--k-correct-bg)' : 'var(--k-incorrect-bg)',
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: isCorrect ? 'var(--k-surface-container-lowest)' : 'rgba(255,255,255,0.2)' }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{
                fontVariationSettings: "'FILL' 1",
                color: isCorrect ? 'var(--k-correct-secondary)' : 'white',
              }}
            >
              {isCorrect ? 'check_circle' : 'close'}
            </span>
          </div>
          <div>
            <h3
              className="font-headline text-xl font-bold"
              style={{ color: isCorrect ? 'var(--k-correct-text)' : 'white' }}
            >
              {isCorrect ? 'Excellent!' : 'Incorrect'}
            </h3>
            <p
              className="text-sm font-medium"
              style={{ color: isCorrect ? 'var(--k-correct-secondary)' : 'var(--k-surface-container-lowest)' }}
            >
              {isCorrect ? `You got it right.` : `Correct answer: ${correctAnswer}`}
            </p>
          </div>
          {!isCorrect && correctAnswerAudio && audioEnabled && (
            <button
              type="button"
              onClick={() => speak(correctAnswerAudio, audioEnabled)}
              className="flex items-center justify-center w-8 h-8 rounded-full active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              aria-label="Play pronunciation"
            >
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNext}
          className={`px-10 py-4 rounded-full font-bold text-lg active:scale-95 transition-transform shadow-md ${
            isCorrect
              ? 'bg-silk-gradient text-white'
              : 'bg-white'
          }`}
          style={isCorrect ? undefined : { color: 'var(--k-incorrect-bg)' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
