import { useState, useEffect, useCallback } from 'react';
import type { Exercise, Answer, ModuleScore, SessionPlan, SessionStep } from '@keiro/types';
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

interface StudySessionResult {
  exercises: Exercise[];
  isReady: boolean;
  score: ModuleScore | null;
  handleComplete: (answers: Answer[]) => void;
  // Session plan support
  currentStep: SessionStep | null;
  currentStepIndex: number;
}

export function useStudySession(
  moduleId: string,
  mode: 'study' | 'review',
  sessionPlan?: SessionPlan,
): StudySessionResult {
  const { audio } = useSettings();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [score, setScore] = useState<ModuleScore | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Session plan mode: load exercises from the first step
    if (sessionPlan) {
      const firstStep = sessionPlan.steps[0];
      setExercises(firstStep ? firstStep.exercises : []);
      setCurrentStepIndex(0);
      setScore(null);
      return;
    }

    // Legacy single-module mode
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
  }, [moduleId, sessionPlan]); // audio intentionally excluded: exercises are generated once per module, not on every audio toggle

  const currentStep: SessionStep | null = sessionPlan
    ? (sessionPlan.steps[currentStepIndex] ?? null)
    : null;

  const handleComplete = useCallback(
    (answers: Answer[]) => {
      if (sessionPlan) {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < sessionPlan.steps.length) {
          // Advance to next step
          const nextStep = sessionPlan.steps[nextIndex];
          setCurrentStepIndex(nextIndex);
          setExercises(nextStep.exercises);
        } else {
          // All steps complete — signal completion
          setScore({ score: 100, passed: true, totalQuestions: answers.length, correctAnswers: answers.filter((a) => a.isCorrect).length, mistakes: answers.filter((a) => !a.isCorrect) });
        }
        return;
      }

      // Legacy mode
      if (mode === 'study') {
        setScore(scoreModule(answers));
      } else {
        // Review mode: still set a flag so the page knows exercises are done
        setScore({ score: 0, passed: false, totalQuestions: 0, correctAnswers: 0, mistakes: [] });
      }
    },
    [mode, sessionPlan, currentStepIndex],
  );

  return {
    exercises,
    isReady: exercises.length > 0,
    score,
    handleComplete,
    currentStep,
    currentStepIndex,
  };
}
