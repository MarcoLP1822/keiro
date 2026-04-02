import Dexie, { type Table } from 'dexie';
import type { ModuleProgress, DailyPlan, Setting, SrsCard } from '@keiro/types';

export class KeiroDB extends Dexie {
  moduleProgress!: Table<ModuleProgress>;
  dailyPlan!: Table<DailyPlan>;
  settings!: Table<Setting>;
  srsCards!: Table<SrsCard>;

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
  }
}

export const db = new KeiroDB();
