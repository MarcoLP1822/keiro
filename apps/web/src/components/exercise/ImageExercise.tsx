import type { Exercise } from '@keiro/types';
import { AnswerOptions } from './AnswerOptions';

interface ImageExerciseProps {
  exercise: Exercise;
  onSelect: (index: number) => void;
  selectedIndex: number | null;
  showFeedback: boolean;
}

export function ImageExercise({ exercise, onSelect, selectedIndex, showFeedback }: ImageExerciseProps) {
  return (
    <div className="flex flex-col gap-6">
      {exercise.imageUrl && (
        <img
          src={exercise.imageUrl}
          alt={exercise.question}
          className="w-full max-w-[300px] mx-auto rounded-xl aspect-square object-cover"
        />
      )}

      <p className="text-lg font-medium text-center" style={{ color: 'var(--k-on-surface)' }}>
        {exercise.question}
      </p>

      <AnswerOptions
        options={exercise.options}
        onSelect={onSelect}
        correctIndex={exercise.correctIndex}
        selectedIndex={selectedIndex}
        showFeedback={showFeedback}
      />
    </div>
  );
}
