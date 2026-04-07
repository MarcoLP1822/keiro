import type { Exercise } from '@keiro/types';

interface ReadingPassageProps {
  exercise: Exercise;
}

export function ReadingPassage({ exercise }: ReadingPassageProps) {
  const isTranslation = exercise.type === 'reading-translation';

  return (
    <div className="flex flex-col gap-4 py-6">
      {/* Japanese passage card */}
      <div
        className="rounded-[16px] p-5"
        style={{
          background: 'var(--k-surface-container-lowest)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {/* TODO: per-word furigana on passages requires a morphological analyzer (e.g., kuromoji) — skip for now */}
        <p
          className="leading-relaxed"
          style={{
            fontSize: '20px',
            fontFamily: '"Noto Sans JP", sans-serif',
            color: 'var(--k-on-surface)',
          }}
        >
          {exercise.question}
        </p>
      </div>

      {/* Question or instruction */}
      <p
        className="text-center text-[15px] font-medium"
        style={{ color: 'var(--k-secondary)' }}
      >
        {isTranslation
          ? 'Choose the correct translation'
          : exercise.questionDetail}
      </p>
    </div>
  );
}
