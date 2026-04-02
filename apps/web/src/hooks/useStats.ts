import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModules } from '@keiro/content';
import { db } from '../services/db';

interface ItemsByType {
  kana: number;
  vocabulary: number;
  kanji: number;
  grammar: number;
}

interface SrsStats {
  total: number;
  dueToday: number;
  learning: number;
  reviewing: number;
  mastered: number;
}

export interface Stats {
  overallProgress: number;
  modulesCompleted: number;
  totalModules: number;
  itemsByType: ItemsByType;
  currentStreak: number;
  srsStats: SrsStats;
}

function calculateStreak(plans: { date: string; completed: boolean }[]): number {
  if (plans.length === 0) return 0;

  // Sort descending by date
  const sorted = [...plans]
    .filter((p) => p.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Start counting from today or yesterday
  const firstDate = sorted[0].date;
  if (firstDate !== today && firstDate !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const diffMs = prevDate.getTime() - currDate.getTime();
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function useStats(): Stats | null {
  const allProgress = useLiveQuery(() => db.moduleProgress.toArray()) ?? [];
  const allPlans = useLiveQuery(() => db.dailyPlan.toArray());
  const allSrsCards = useLiveQuery(() => db.srsCards.toArray());

  // Still loading
  if (allPlans === undefined || allSrsCards === undefined) return null;

  const allModules = getAllModules();
  const totalModules = allModules.length;
  const passedModules = allProgress.filter((p) => p.status === 'passed');
  const modulesCompleted = passedModules.length;
  const overallProgress = totalModules > 0 ? Math.round((modulesCompleted / totalModules) * 100) : 0;

  // Count items by type from passed modules
  const passedIds = new Set(passedModules.map((p) => p.moduleId));
  const itemsByType: ItemsByType = { kana: 0, vocabulary: 0, kanji: 0, grammar: 0 };

  for (const mod of allModules) {
    if (passedIds.has(mod.id)) {
      const type = mod.type as keyof ItemsByType;
      if (type in itemsByType) {
        itemsByType[type] += mod.items.length;
      }
    }
  }

  // Streak
  const currentStreak = calculateStreak(allPlans);

  // SRS stats
  const today = new Date().toISOString().slice(0, 10);
  const total = allSrsCards.length;
  const dueToday = allSrsCards.filter((c) => c.nextReview <= today).length;
  const learning = allSrsCards.filter((c) => c.interval < 7).length;
  const reviewing = allSrsCards.filter((c) => c.interval >= 7 && c.interval <= 30).length;
  const mastered = allSrsCards.filter((c) => c.interval > 30).length;

  return {
    overallProgress,
    modulesCompleted,
    totalModules,
    itemsByType,
    currentStreak,
    srsStats: { total, dueToday, learning, reviewing, mastered },
  };
}
