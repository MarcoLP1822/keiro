import { storage } from './storage';
import { showNotification } from './notifications';
import { db } from './db';

class ReminderService {
  private checkTimer: ReturnType<typeof setTimeout> | null = null;

  /** Called on app start to check if a reminder should fire. */
  async checkAndRemind() {
    const reminderEnabled = await storage.getSetting('reminderEnabled');
    if (!reminderEnabled) return;

    const reminderTime =
      ((await storage.getSetting('reminderTime')) as string) || '20:00';
    const lastStudy = await this.getLastStudyDate();
    const today = new Date().toISOString().split('T')[0];

    // User already studied today -- no reminder needed
    if (lastStudy === today) return;

    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    if (now >= reminderDate) {
      // Past reminder time and hasn't studied -- show now
      await this.fireNotification();
    } else {
      // Schedule for later today
      const delay = reminderDate.getTime() - now.getTime();
      this.scheduleCheck(delay);
    }
  }

  private scheduleCheck(delayMs: number) {
    if (this.checkTimer) clearTimeout(this.checkTimer);
    this.checkTimer = setTimeout(async () => {
      // Re-check in case user studied between now and the scheduled time
      const lastStudy = await this.getLastStudyDate();
      const today = new Date().toISOString().split('T')[0];
      if (lastStudy !== today) {
        await this.fireNotification();
      }
    }, delayMs);
  }

  private async fireNotification() {
    await showNotification(
      'Time to study!',
      'Your daily Japanese practice is waiting. Just 5 minutes!',
    );
  }

  private async getLastStudyDate(): Promise<string | null> {
    // Find the most recent daily plan that has at least one completed module
    const plans = await db.dailyPlan
      .orderBy('date')
      .reverse()
      .limit(1)
      .toArray();

    if (plans.length === 0) return null;

    const latest = plans[0];
    if (latest.completed) return latest.date;

    // Check if any module was completed today via moduleProgress
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = await db.moduleProgress
      .where('completedAt')
      .between(today + 'T00:00:00', today + 'T23:59:59')
      .count();

    return todayProgress > 0 ? today : null;
  }
}

export const reminderService = new ReminderService();
