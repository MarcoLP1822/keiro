import Dexie, { type Table } from 'dexie';
import type { ModuleProgress, DailyPlan, Setting } from '@keiro/types';

export class KeiroDB extends Dexie {
  moduleProgress!: Table<ModuleProgress>;
  dailyPlan!: Table<DailyPlan>;
  settings!: Table<Setting>;

  constructor() {
    super('keiro');
    this.version(1).stores({
      moduleProgress: 'moduleId, status, score, completedAt',
      dailyPlan: 'date, completed',
      settings: 'key',
    });
  }
}

export const db = new KeiroDB();
