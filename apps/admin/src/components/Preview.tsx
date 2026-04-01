import { useMemo } from 'react';
import { type Module, type KanaItem, type Exercise } from '@keiro/types';
import { generateKanaExercises } from '@keiro/engine';

interface PreviewProps {
  module: Module;
  allKanaItems: KanaItem[];
}

/** Shows a sample of generated exercises for the current module. */
export function Preview({ module, allKanaItems }: PreviewProps) {
  const exercises = useMemo(() => {
    if (module.items.length === 0) return [];
    return generateKanaExercises(module, allKanaItems);
  }, [module, allKanaItems]);

  const sample = exercises.slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Exercise Preview</h2>
      {sample.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No items in this module. Add items to see exercise previews.
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            Showing {sample.length} of {exercises.length} generated exercises
          </p>
          {sample.map((exercise, i) => (
            <ExerciseCard key={i} exercise={exercise} index={i} />
          ))}
        </>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const typeLabel: Record<string, string> = {
    'char-to-romaji': 'Character -> Romaji',
    'romaji-to-char': 'Romaji -> Character',
    'audio-to-char': 'Audio -> Character',
  };

  return (
    <div className="border rounded p-3 bg-gray-50 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">#{index + 1}</span>
        <span className="text-xs bg-gray-200 rounded px-2 py-0.5">
          {typeLabel[exercise.type] ?? exercise.type}
        </span>
      </div>
      <div className="text-lg text-jp font-medium">{exercise.question}</div>
      <div className="flex gap-2 flex-wrap">
        {exercise.options.map((option, optIdx) => (
          <span
            key={optIdx}
            className={`px-3 py-1 rounded border text-sm ${
              optIdx === exercise.correctIndex
                ? 'bg-success text-white border-success font-semibold'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
