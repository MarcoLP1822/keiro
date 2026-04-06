import { useMemo } from 'react';
import type { PlannedSession } from '@keiro/types';
import { calculateDailyPlan, getDueCards, updateStreak, createDefaultStreakData } from '@keiro/engine';
import { getAllModules } from '@keiro/content';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useProgress } from './useProgress';
import { useSettings } from './useSettings';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
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

  const plan: PlannedSession | null = useMemo(() => {
    const progressMap = new Map(
      allProgress.map((p) => [p.moduleId, p]),
    );

    const allModules = getAllModules();
    const dueCards = allSrsCards ? getDueCards(allSrsCards) : [];

    const session = calculateDailyPlan({
      size: planSize,
      progressMap,
      allModules,
      dueCards,
    });

    // All modules finished and no reviews
    if (session.modules.length === 0 && session.reviewCount === 0) return null;

    return session;
  }, [allProgress, planSize, allSrsCards]);

  async function markComplete(): Promise<void> {
    const date = todayString();
    try {
      await db.dailyPlan.put({
        date,
        modules: plan?.modules ?? [],
        completed: true,
      });
    } catch (err) {
      console.error('[useDailyPlan] Failed to mark daily plan complete:', err);
      throw err;
    }

    // Update streak when daily plan is completed
    try {
      const existing = await db.streakData.get('current');
      const prev = existing ?? createDefaultStreakData();
      const { data } = updateStreak(prev, date);
      await db.streakData.put(data);
    } catch (err) {
      console.error('[useDailyPlan] Failed to update streak after plan completion:', err);
      throw err;
    }
  }

  return { plan, isComplete, markComplete };
}
