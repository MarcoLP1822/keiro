import type { ModuleProgress, DailyPlan, Setting } from '@keiro/types';
import { db } from './db';

class StorageService {
  async getModuleProgress(moduleId: string): Promise<ModuleProgress | undefined> {
    return db.moduleProgress.get(moduleId);
  }

  async saveModuleProgress(progress: ModuleProgress): Promise<void> {
    await db.moduleProgress.put(progress);
  }

  async getAllProgress(): Promise<ModuleProgress[]> {
    return db.moduleProgress.toArray();
  }

  async getDailyPlan(date: string): Promise<DailyPlan | undefined> {
    return db.dailyPlan.get(date);
  }

  async saveDailyPlan(plan: DailyPlan): Promise<void> {
    await db.dailyPlan.put(plan);
  }

  async getSetting(key: string): Promise<Setting['value'] | undefined> {
    const setting = await db.settings.get(key);
    return setting?.value;
  }

  async setSetting(key: string, value: Setting['value']): Promise<void> {
    await db.settings.put({ key, value });
  }

  async resetAll(): Promise<void> {
    await db.transaction('rw', db.moduleProgress, db.dailyPlan, db.settings, async () => {
      await db.moduleProgress.clear();
      await db.dailyPlan.clear();
      await db.settings.clear();
    });
  }
}

export const storage = new StorageService();
