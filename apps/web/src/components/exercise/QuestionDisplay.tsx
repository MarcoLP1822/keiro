import type { Exercise } from '@keiro/types';

interface QuestionDisplayProps {
  exercise: Exercise;
}

const questionText: Record<string, string> = {
  'char-to-romaji': 'What does this mean?',
  'romaji-to-char': 'Which character is this?',
  'audio-to-char': 'What character do you hear?',
};

export function QuestionDisplay({ exercise }: QuestionDisplayProps) {
  const prompt = questionText[exercise.type] ?? 'What is this?';

  // For char-to-romaji and audio-to-char, show the Japanese character large.
  // For romaji-to-char, show the romaji text at normal size.
  const showLargeCharacter = exercise.type !== 'romaji-to-char';

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-lg text-gray-600">{prompt}</p>
      <p
        className={
          showLargeCharacter
            ? 'text-[48px] leading-tight font-bold text-gray-900'
            : 'text-2xl font-semibold text-gray-900'
        }
      >
        {exercise.question}
      </p>
    </div>
  );
}
