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
  leeches: number;
}

export interface Stats {
  overallProgress: number;
  modulesCompleted: number;
  totalModules: number;
  itemsByType: ItemsByType;
  srsStats: SrsStats;
}

export function useStats(): Stats | null {
  const allProgress = useLiveQuery(() => db.moduleProgress.toArray()) ?? [];
  const allSrsCards = useLiveQuery(() => db.srsCards.toArray());

  // Still loading
  if (allSrsCards === undefined) return null;

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

  // SRS stats
  const today = new Date().toISOString().slice(0, 10);
  const total = allSrsCards.length;
  const dueToday = allSrsCards.filter((c) => c.nextReview <= today).length;
  const learning = allSrsCards.filter((c) => c.interval < 7).length;
  const reviewing = allSrsCards.filter((c) => c.interval >= 7 && c.interval <= 30).length;
  const mastered = allSrsCards.filter((c) => c.interval > 30).length;
  const leeches = allSrsCards.filter((c) => c.isLeech).length;

  return {
    overallProgress,
    modulesCompleted,
    totalModules,
    itemsByType,
    srsStats: { total, dueToday, learning, reviewing, mastered, leeches },
  };
}
