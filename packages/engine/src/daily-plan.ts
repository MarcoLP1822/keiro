import type { Module, ModuleProgress, PlannedSession } from '@keiro/types';

export type PlanSize = 'small' | 'medium' | 'large';

export interface DailyPlanConfig {
  size: PlanSize;
  progressMap: Map<string, ModuleProgress>;
  allModules: Module[];
}

const MAX_EXERCISES: Record<PlanSize, number> = {
  small: 10,
  medium: 20,
  large: 30,
};

const MAX_NEW_ITEMS: Record<PlanSize, number> = {
  small: 3,
  medium: 5,
  large: 8,
};

/**
 * Returns the first non-passed module in order, or null if all are complete.
 */
export function getCurrentModule(
  allModules: Module[],
  progressMap: Map<string, ModuleProgress>,
): Module | null {
  const sorted = [...allModules].sort((a, b) => a.order - b.order);
  for (const mod of sorted) {
    const progress = progressMap.get(mod.id);
    if (!progress || progress.status !== 'passed') {
      return mod;
    }
  }
  return null;
}

/**
 * Calculates a daily plan based on current progress and plan size.
 * For MVP (no SRS), the plan consists of exercises from the current module.
 */
export function calculateDailyPlan(config: DailyPlanConfig): PlannedSession {
  const { size, progressMap, allModules } = config;

  const currentModule = getCurrentModule(allModules, progressMap);

  if (!currentModule) {
    return {
      modules: [],
      estimatedMinutes: 0,
      newItemCount: 0,
      isComplete: true,
    };
  }

  const maxExercises = MAX_EXERCISES[size];
  const maxNew = MAX_NEW_ITEMS[size];

  // For MVP: exercises come from the current module
  // Each kana item produces 2 exercises (char-to-romaji + romaji-to-char)
  const itemCount = currentModule.items.length;
  const newItems = Math.min(itemCount, maxNew);
  const exerciseCount = Math.min(itemCount * 2, maxExercises);

  // Rough estimate: ~30 seconds per exercise
  const estimatedMinutes = Math.max(1, Math.round(exerciseCount * 0.5));

  return {
    modules: [currentModule.id],
    estimatedMinutes,
    newItemCount: newItems,
    isComplete: false,
  };
}
