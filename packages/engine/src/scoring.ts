import type { Answer, ModuleScore, Module, ModuleProgress, ModuleStatus } from '@keiro/types';

const PASS_THRESHOLD = 0.8;

/**
 * Scores a completed module session from an array of answers.
 * Pass threshold is 80%.
 */
export function scoreModule(answers: Answer[]): ModuleScore {
  if (answers.length === 0) {
    return {
      score: 0,
      passed: false,
      totalQuestions: 0,
      correctAnswers: 0,
      mistakes: [],
    };
  }

  const correct = answers.filter((a) => a.isCorrect).length;
  const ratio = correct / answers.length;

  return {
    score: Math.round(ratio * 100),
    passed: ratio >= PASS_THRESHOLD,
    totalQuestions: answers.length,
    correctAnswers: correct,
    mistakes: answers.filter((a) => !a.isCorrect),
  };
}

/**
 * Determines the status a module should have based on its position
 * in the ordered module list and progress of prior modules.
 *
 * - First module is always 'available' (unless already passed).
 * - A module is 'available' only if all prior modules are 'passed'.
 * - Otherwise it is 'locked'.
 * - If the module itself is 'passed' in the progress map, returns 'passed'.
 */
export function getModuleStatus(
  moduleId: string,
  allModules: Module[],
  progressMap: Map<string, ModuleProgress>,
): ModuleStatus {
  const progress = progressMap.get(moduleId);
  if (progress?.status === 'passed') {
    return 'passed';
  }

  const sorted = [...allModules].sort((a, b) => a.order - b.order);
  const moduleIndex = sorted.findIndex((m) => m.id === moduleId);

  // Module not found in the list — treat as locked
  if (moduleIndex === -1) {
    return 'locked';
  }

  // First module is always available
  if (moduleIndex === 0) {
    return 'available';
  }

  // Check all prior modules are passed
  for (let i = 0; i < moduleIndex; i++) {
    const priorProgress = progressMap.get(sorted[i].id);
    if (!priorProgress || priorProgress.status !== 'passed') {
      return 'locked';
    }
  }

  return 'available';
}
