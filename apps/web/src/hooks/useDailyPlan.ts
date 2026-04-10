import { useMemo } from 'react';
import type { PlannedSession, SessionPlan } from '@keiro/types';
import {
  calculateDailyPlan,
  getCurrentModule,
  getDueCards,
  isThematic,
  planDynamicSession,
  updateStreak,
  createDefaultStreakData,
  localDateString,
} from '@keiro/engine';
import { getAllModules } from '@keiro/content';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useProgress } from './useProgress';
import { useSettings } from './useSettings';

function todayString(): string {
  return localDateString();
}

export function useDailyPlan() {
  const { allProgress } = useProgress();
  const { planSize } = useSettings();

  const todayPlan = useLiveQuery(
    () => db.dailyPlan.get(todayString()),
    [],
  );

  // Load all SRS cards and compute due cards
  const allSrsCards = useLiveQuery(
    () => db.srsCards.toArray(),
    [],
  );

  const isComplete = todayPlan?.completed ?? false;

  // Shared derivations consumed by both plan and sessionPlan
  const sharedData = useMemo(() => {
    const progressMap = new Map(
      allProgress.map((p) => [p.moduleId, p]),
    );
    const allModules = getAllModules();
    const dueCards = allSrsCards ? getDueCards(allSrsCards) : [];
    return { progressMap, allModules, dueCards };
  }, [allProgress, allSrsCards]);

  const plan: PlannedSession | null = useMemo(() => {
    const { progressMap, allModules, dueCards } = sharedData;
    const currentModule = getCurrentModule(allModules, progressMap);

    // Thematic modules use the dynamic session planner; the legacy PlannedSession
    // is still returned for backward compatibility (consumers read modules/reviewCards).
    if (currentModule && isThematic(currentModule)) {
      // planDynamicSession produces the real plan (exposed via sessionPlan below)
      // but we still need a valid PlannedSession for backward-compat consumers.
      // Return a minimal PlannedSession pointing at this module.
      return {
        modules: [currentModule.id],
        estimatedMinutes: 15,
        newItemCount: currentModule.vocab?.length ?? currentModule.items.length,
        reviewCount: Math.min(dueCards.length, 3),
        reviewCards: dueCards.slice(0, 3).map((c) => c.id),
        isComplete: false,
      };
    }

    const session = calculateDailyPlan({
      size: planSize,
      progressMap,
      allModules,
      dueCards,
    });

    // All modules finished and no reviews
    if (session.modules.length === 0 && session.reviewCount === 0) return null;

    return session;
  }, [sharedData, planSize]);

  /**
   * The dynamic session plan for the current thematic module.
   * Null when the current module is a legacy (non-thematic) module.
   */
  const sessionPlan: SessionPlan | null = useMemo(() => {
    const { progressMap, allModules, dueCards } = sharedData;
    const currentModule = getCurrentModule(allModules, progressMap);

    if (!currentModule || !isThematic(currentModule)) return null;

    // Build the known vocab set from all progress on this module's vocab items.
    // For now, we treat every vocab item in the module as unknown until the user
    // explicitly marks them known. In future, this will draw from the learner model.
    const knownVocab = new Set<string>();
    const knownGrammar = new Set<string>();

    return planDynamicSession({
      module: currentModule,
      knownVocab,
      knownGrammar,
      dueCards,
      size: planSize,
    });
  }, [sharedData, planSize]);

  async function markComplete(): Promise<void> {
    const date = todayString();
    await db.transaction('rw', [db.dailyPlan, db.streakData], async () => {
      const existing = await db.dailyPlan.get(date);
      if (existing?.completed) return;

      await db.dailyPlan.put({
        date,
        modules: plan?.modules ?? [],
        completed: true,
      });

      const streakRecord = await db.streakData.get('current');
      const prev = streakRecord ?? createDefaultStreakData();
      const { data } = updateStreak(prev, date);
      await db.streakData.put(data);
    });
  }

  return { plan, sessionPlan, isComplete, markComplete };
}
