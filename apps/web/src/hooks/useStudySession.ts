import { useState, useEffect, useCallback } from 'react';
import type { Exercise, Answer, ModuleScore } from '@keiro/types';
import {
  generateKanaExercises,
  generateAudioExercises,
  generateVocabExercises,
  generateKanjiExercises,
  generateGrammarExercises,
  generateReadingExercises,
  scoreModule,
  shuffle,
} from '@keiro/engine';
import {
  getModuleById,
  getKanaItems,
  getVocabItems,
  getKanjiItems,
  getGrammarItems,
} from '@keiro/content';
import { useSettings } from './useSettings';

export function useStudySession(moduleId: string, mode: 'study' | 'review') {
  const { audio } = useSettings();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [score, setScore] = useState<ModuleScore | null>(null);

  useEffect(() => {
    const mod = getModuleById(moduleId);
    if (!mod) return;

    let generated: Exercise[] = [];

    switch (mod.type) {
      case 'kana': {
        const allKana = getKanaItems();
        generated = generateKanaExercises(mod, allKana);
        if (audio) {
          const audioExercises = generateAudioExercises(mod, allKana);
          generated = shuffle([...generated, ...audioExercises]);
        }
        break;
      }
      case 'vocabulary': {
        const allVocab = getVocabItems();
        generated = generateVocabExercises(mod, allVocab);
        break;
      }
      case 'kanji': {
        const allKanji = getKanjiItems();
        generated = generateKanjiExercises(mod, allKanji);
        break;
      }
      case 'grammar': {
        const allGrammar = getGrammarItems();
        generated = generateGrammarExercises(mod, allGrammar);
        break;
      }
      case 'reading': {
        generated = generateReadingExercises(mod);
        break;
      }
    }

    setExercises(generated);
    setScore(null);
  }, [moduleId]); // audio intentionally excluded: exercises are generated once per module, not on every audio toggle

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
