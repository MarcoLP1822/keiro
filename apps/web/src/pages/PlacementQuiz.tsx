import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Exercise, Answer } from '@keiro/types';
import { generatePlacementQuiz, evaluatePlacement } from '@keiro/engine';
import { getAllModules, getKanaItems, getVocabItems, getGrammarItems } from '@keiro/content';
import { ExerciseRenderer } from '../components/exercise/ExerciseRenderer';
import { storage } from '../services/storage';
import { events } from '../services/analytics';

export function PlacementQuiz() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const allModules = getAllModules();
    const allKana = getKanaItems();
    const allVocab = getVocabItems();
    const allGrammar = getGrammarItems();
    setExercises(generatePlacementQuiz(allModules, allKana, allVocab, allGrammar));
  }, []);

  async function handleComplete(answers: Answer[]) {
    const allModules = getAllModules();
    const result = evaluatePlacement(answers, allModules);
    const passedSet = new Set(result.passedModuleIds);

    // Save progress for all modules
    for (const mod of allModules) {
      if (passedSet.has(mod.id)) {
        await storage.saveModuleProgress({
          moduleId: mod.id,
          status: 'passed',
          score: 100, // Placement pass = full credit
          completedAt: new Date().toISOString(),
          attempts: 1,
        });
      } else if (mod.id === result.startModuleId) {
        await storage.saveModuleProgress({
          moduleId: mod.id,
          status: 'available',
          score: null,
          completedAt: null,
          attempts: 0,
        });
      } else {
        await storage.saveModuleProgress({
          moduleId: mod.id,
          status: 'locked',
          score: null,
          completedAt: null,
          attempts: 0,
        });
      }
    }

    events.placementComplete(result.startModuleId);

    // Full page reload ensures Dexie live query picks up the new data
    window.location.href = '/';
  }

  function handleExit() {
    navigate('/welcome');
  }

  if (exercises.length === 0) return null;

  return (
    <ExerciseRenderer
      exercises={exercises}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
