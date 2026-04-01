import { useMemo } from 'react';
import type { PlannedSession } from '@keiro/types';
import { calculateDailyPlan } from '@keiro/engine';
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

  const isComplete = todayPlan?.completed ?? false;

  const plan: PlannedSession | null = useMemo(() => {
    const progressMap = new Map(
      allProgress.map((p) => [p.moduleId, p]),
    );

    const allModules = getAllModules();

    const session = calculateDailyPlan({
      size: planSize,
      progressMap,
      allModules,
    });

    // All modules finished
    if (session.modules.length === 0) return null;

    return session;
  }, [allProgress, planSize]);

  async function markComplete(): Promise<void> {
    const date = todayString();
    await db.dailyPlan.put({
      date,
      modules: plan?.modules ?? [],
      completed: true,
    });
  }

  return { plan, isComplete, markComplete };
}
