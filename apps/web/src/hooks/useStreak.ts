import { useLiveQuery } from 'dexie-react-hooks';
import { createDefaultStreakData } from '@keiro/engine';
import { db } from '../services/db';

export function useStreak() {
  const streakData = useLiveQuery(
    () => db.streakData.get('current'),
    [],
  );

  const current = streakData ?? createDefaultStreakData();

  return {
    streak: current.currentStreak,
    longestStreak: current.longestStreak,
    freezesAvailable: current.freezesAvailable,
    freezesUsed: current.freezesUsed,
  };
}
