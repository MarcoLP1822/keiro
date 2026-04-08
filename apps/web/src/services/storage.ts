import type { ModuleProgress, DailyPlan, Setting, SrsCard, StreakData } from '@keiro/types';
import { localDateString } from '@keiro/engine';
import { db } from './db';
import { syncService } from './sync';

class StorageService {
  private userId: string | null = null;

  setUserId(id: string | null) {
    this.userId = id;
    syncService.setUserId(id);
  }

  async getModuleProgress(moduleId: string): Promise<ModuleProgress | undefined> {
    return db.moduleProgress.get(moduleId);
  }

  async saveModuleProgress(progress: ModuleProgress): Promise<void> {
    await db.moduleProgress.put({
      ...progress,
      updatedAt: new Date().toISOString(),
      userId: this.userId,
    });
    syncService.scheduleSync();
  }

  async getAllProgress(): Promise<ModuleProgress[]> {
    return db.moduleProgress.toArray();
  }

  async getDailyPlan(date: string): Promise<DailyPlan | undefined> {
    return db.dailyPlan.get(date);
  }

  async saveDailyPlan(plan: DailyPlan): Promise<void> {
    await db.dailyPlan.put({
      ...plan,
      updatedAt: new Date().toISOString(),
      userId: this.userId,
    });
    syncService.scheduleSync();
  }

  async getSetting(key: string): Promise<Setting['value'] | undefined> {
    const setting = await db.settings.get(key);
    return setting?.value;
  }

  async setSetting(key: string, value: Setting['value']): Promise<void> {
    await db.settings.put({
      key,
      value,
      updatedAt: new Date().toISOString(),
      userId: this.userId,
    });
    syncService.scheduleSync();
  }

  // --- SRS Card methods ---

  async getSrsCards(): Promise<SrsCard[]> {
    return db.srsCards.toArray();
  }

  async getSrsCard(id: string): Promise<SrsCard | undefined> {
    return db.srsCards.get(id);
  }

  async saveSrsCard(card: SrsCard): Promise<void> {
    await db.srsCards.put({
      ...card,
      updatedAt: new Date().toISOString(),
      userId: this.userId,
    });
    syncService.scheduleSync();
  }

  async saveSrsCards(cards: SrsCard[]): Promise<void> {
    const now = new Date().toISOString();
    await db.srsCards.bulkPut(
      cards.map((card) => ({
        ...card,
        updatedAt: now,
        userId: this.userId,
      })),
    );
    syncService.scheduleSync();
  }

  async getDueCards(date?: string): Promise<SrsCard[]> {
    const today = date || localDateString();
    return db.srsCards.where('nextReview').belowOrEqual(today).toArray();
  }

  // --- Streak methods ---

  async getStreakData(): Promise<StreakData | undefined> {
    return db.streakData.get('current');
  }

  async saveStreakData(data: StreakData): Promise<void> {
    await db.streakData.put(data);
  }

  async resetAll(): Promise<void> {
    await db.transaction('rw', [db.moduleProgress, db.dailyPlan, db.settings, db.srsCards, db.streakData], async () => {
      await db.moduleProgress.clear();
      await db.dailyPlan.clear();
      await db.settings.clear();
      await db.srsCards.clear();
      await db.streakData.clear();
    });
  }
}

export const storage = new StorageService();
