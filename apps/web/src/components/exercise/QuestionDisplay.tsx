import type { Exercise } from '@keiro/types';
import { speak } from '../../services/audio';

interface QuestionDisplayProps {
  exercise: Exercise;
  audioEnabled?: boolean;
}

const questionText: Record<string, string> = {
  'char-to-romaji': 'What does this mean?',
  'romaji-to-char': 'Which character is this?',
  'audio-to-char': 'What character do you hear?',
};

export function QuestionDisplay({ exercise, audioEnabled = true }: QuestionDisplayProps) {
  const prompt = questionText[exercise.type] ?? 'What is this?';
  const isAudio = exercise.type === 'audio-to-char';

  const handlePlayAudio = () => {
    speak(exercise.question, audioEnabled);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p
        className="text-[15px]"
        style={{ color: 'var(--ios-secondary-label)' }}
      >
        {prompt}
      </p>
      {isAudio ? (
        <button
          type="button"
          onClick={handlePlayAudio}
          className="flex items-center justify-center w-20 h-20 rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-95"
          style={{ background: 'rgba(0,122,255,0.1)' }}
          aria-label="Play pronunciation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10"
            style={{ color: 'var(--ios-blue)' }}
          >
            <path d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.2 1.2 0 0 1-2.05.849L5.1 15.6H2.4A1.2 1.2 0 0 1 1.2 14.4V9.6a1.2 1.2 0 0 1 1.2-1.2h2.7l4.85-4.449a1.2 1.2 0 0 1 1.31-.26ZM15.53 7.47a.75.75 0 0 1 1.06 0 6.75 6.75 0 0 1 0 9.06.75.75 0 0 1-1.06-1.06 5.25 5.25 0 0 0 0-6.94.75.75 0 0 1 0-1.06ZM18.36 4.64a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.983 0 13.79a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.67.75.75 0 0 1 0-1.06Z"/>
          </svg>
        </button>
      ) : (
        <p
          className={
            exercise.type === 'char-to-romaji'
              ? 'text-[56px] leading-tight font-bold'
              : 'text-2xl font-semibold'
          }
          style={{ color: 'var(--ios-label)' }}
        >
          {exercise.question}
        </p>
      )}
    </div>
  );
}
