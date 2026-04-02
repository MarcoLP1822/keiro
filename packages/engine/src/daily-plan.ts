import type { Module, ModuleProgress, PlannedSession, SrsCard } from '@keiro/types';

export type PlanSize = 'small' | 'medium' | 'large';

export interface DailyPlanConfig {
  size: PlanSize;
  progressMap: Map<string, ModuleProgress>;
  allModules: Module[];
  dueCards?: SrsCard[];
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

const REVIEW_CAPS: Record<PlanSize, number> = {
  small: 15,
  medium: 30,
  large: 50,
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
 * Calculates a daily plan based on current progress, plan size, and due SRS cards.
 * Reviews are prioritized: they fill up first, then new items get remaining capacity.
 */
export function calculateDailyPlan(config: DailyPlanConfig): PlannedSession {
  const { size, progressMap, allModules, dueCards = [] } = config;

  // Cap reviews at the session size limit
  const reviewCap = REVIEW_CAPS[size];
  const cappedReviews = dueCards.slice(0, reviewCap);
  const reviewCount = cappedReviews.length;
  const reviewCardIds = cappedReviews.map((c) => c.id);

  const currentModule = getCurrentModule(allModules, progressMap);

  // All modules done and no reviews — nothing to do
  if (!currentModule && reviewCount === 0) {
    return {
      modules: [],
      estimatedMinutes: 0,
      newItemCount: 0,
      reviewCount: 0,
      reviewCards: [],
      isComplete: true,
    };
  }

  const maxExercises = MAX_EXERCISES[size];
  const maxNew = MAX_NEW_ITEMS[size];

  // Calculate remaining capacity after reviews
  const remainingCapacity = Math.max(0, maxExercises - reviewCount);

  let newItems = 0;
  let modules: string[] = [];

  if (currentModule && remainingCapacity > 0) {
    const itemCount = currentModule.items.length;
    newItems = Math.min(itemCount, maxNew, remainingCapacity);
    modules = [currentModule.id];
  }

  // If nothing to do today (no reviews, no new items)
  if (reviewCount === 0 && newItems === 0) {
    return {
      modules: [],
      estimatedMinutes: 0,
      newItemCount: 0,
      reviewCount: 0,
      reviewCards: [],
      isComplete: true,
    };
  }

  // Rough estimate: ~30 seconds per exercise/review
  const totalItems = reviewCount + (newItems > 0 ? newItems * 2 : 0);
  const estimatedMinutes = Math.max(1, Math.round(totalItems * 0.5));

  return {
    modules,
    estimatedMinutes,
    newItemCount: newItems,
    reviewCount,
    reviewCards: reviewCardIds,
    isComplete: false,
  };
}
