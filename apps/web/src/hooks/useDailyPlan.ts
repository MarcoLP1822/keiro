import { useMemo } from 'react';
import type { PlannedSession } from '@keiro/types';
import { calculateDailyPlan, getDueCards, updateStreak, createDefaultStreakData, localDateString } from '@keiro/engine';
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

  return { plan, isComplete, markComplete };
}
