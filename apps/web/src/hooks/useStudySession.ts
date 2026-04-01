import { useState, useEffect, useCallback } from 'react';
import type { Exercise, Answer, ModuleScore } from '@keiro/types';
import { generateKanaExercises, generateAudioExercises, scoreModule, shuffle } from '@keiro/engine';
import { getModuleById, getKanaItems } from '@keiro/content';
import { useSettings } from './useSettings';

export function useStudySession(moduleId: string, mode: 'study' | 'review') {
  const { audio } = useSettings();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [score, setScore] = useState<ModuleScore | null>(null);

  useEffect(() => {
    const mod = getModuleById(moduleId);
    if (!mod) return;

    const allKana = getKanaItems();
    let generated = generateKanaExercises(mod, allKana);

    if (audio) {
      const audioExercises = generateAudioExercises(mod, allKana);
      generated = shuffle([...generated, ...audioExercises]);
    }

    setExercises(generated);
    setScore(null);
  }, [moduleId, audio]);

  const handleComplete = useCallback(
    (answers: Answer[]) => {
      if (mode === 'study') {
        setScore(scoreModule(answers));
      } else {
        // Review mode: still set a flag so the page knows exercises are done
        setScore({ score: 0, passed: false, totalQuestions: 0, correctAnswers: 0, mistakes: [] });
      }
    },
    [mode],
  );

  return {
    exercises,
    isReady: exercises.length > 0,
    score,
    handleComplete,
  };
}
