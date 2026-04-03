import Dexie, { type Table } from 'dexie';
import type { ModuleProgress, DailyPlan, Setting, SrsCard, StreakData } from '@keiro/types';

export class KeiroDB extends Dexie {
  moduleProgress!: Table<ModuleProgress>;
  dailyPlan!: Table<DailyPlan>;
  settings!: Table<Setting>;
  srsCards!: Table<SrsCard>;
  streakData!: Table<StreakData>;

  constructor() {
    super('keiro');
    this.version(1).stores({
      moduleProgress: 'moduleId, status, score, completedAt',
      dailyPlan: 'date, completed',
      settings: 'key',
    });
    this.version(2).stores({
      moduleProgress: 'moduleId, status, score, completedAt',
      dailyPlan: 'date, completed',
      settings: 'key',
      srsCards: 'id, moduleId, contentType, nextReview',
    });
    this.version(3).stores({
      moduleProgress: 'moduleId, status, score, completedAt, updatedAt, userId',
      dailyPlan: 'date, completed, updatedAt, userId',
      settings: 'key, updatedAt, userId',
      srsCards: 'id, moduleId, contentType, nextReview, updatedAt, userId',
    }).upgrade(tx => {
      const now = new Date().toISOString();
      return Promise.all([
        tx.table('moduleProgress').toCollection().modify({ updatedAt: now, userId: null }),
        tx.table('dailyPlan').toCollection().modify({ updatedAt: now, userId: null }),
        tx.table('settings').toCollection().modify({ updatedAt: now, userId: null }),
        tx.table('srsCards').toCollection().modify({ updatedAt: now, userId: null }),
      ]);
    });
    this.version(4).stores({
      moduleProgress: 'moduleId, status, score, completedAt, updatedAt, userId',
      dailyPlan: 'date, completed, updatedAt, userId',
      settings: 'key, updatedAt, userId',
      srsCards: 'id, moduleId, contentType, nextReview, updatedAt, userId',
      streakData: 'id',
    });
  }
}

export const db = new KeiroDB();
