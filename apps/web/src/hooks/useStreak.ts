import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { updateStreak, createDefaultStreakData } from '@keiro/engine';
import { db } from '../services/db';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak() {
  const [lastResult, setLastResult] = useState<{
    freezeUsed: boolean;
    freezeEarned: boolean;
  } | null>(null);

  const streakData = useLiveQuery(
    () => db.streakData.get('current'),
    [],
  );

  const current = streakData ?? createDefaultStreakData();
  const todayCompleted = current.lastStudyDate === todayString();

  const recordStudyDay = useCallback(async () => {
    const existing = await db.streakData.get('current');
    const prev = existing ?? createDefaultStreakData();
    const { data, freezeUsed, freezeEarned } = updateStreak(prev, todayString());
    await db.streakData.put(data);
    setLastResult({ freezeUsed, freezeEarned });
  }, []);

  return {
    streak: current.currentStreak,
    longestStreak: current.longestStreak,
    freezesAvailable: current.freezesAvailable,
    freezesUsed: current.freezesUsed,
    todayCompleted,
    lastStudyDate: current.lastStudyDate,
    recordStudyDay,
    lastResult,
  };
}
