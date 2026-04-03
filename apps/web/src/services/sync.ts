import { supabase } from './supabase';
import { db } from './db';

class SyncService {
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;
  private _lastSyncedAt: string | null = null;

  get lastSyncedAt(): string | null {
    return this._lastSyncedAt;
  }

  setUserId(id: string | null) {
    this.userId = id;
    if (id) {
      this.fullSync();
    }
  }

  scheduleSync() {
    if (!supabase || !this.userId) return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => this.pushToCloud(), 2000);
  }

  async pushToCloud(): Promise<void> {
    if (!supabase || !this.userId) return;

    try {
      const [progress, plans, settings, cards] = await Promise.all([
        db.moduleProgress.toArray(),
        db.dailyPlan.toArray(),
        db.settings.toArray(),
        db.srsCards.toArray(),
      ]);

      // Upsert module progress
      if (progress.length > 0) {
        const rows = progress.map((p) => ({
          user_id: this.userId!,
          module_id: p.moduleId,
          status: p.status,
          score: p.score,
          completed_at: p.completedAt,
          attempts: p.attempts,
          updated_at: p.updatedAt ?? new Date().toISOString(),
        }));
        await supabase.from('module_progress').upsert(rows, {
          onConflict: 'user_id,module_id',
        });
      }

      // Upsert SRS cards
      if (cards.length > 0) {
        const rows = cards.map((c) => ({
          id: c.id,
          user_id: this.userId!,
          item_id: c.itemId,
          module_id: c.moduleId,
          content_type: c.contentType,
          interval: c.interval,
          repetitions: c.repetitions,
          ease_factor: c.easeFactor,
          next_review: c.nextReview,
          last_review: c.lastReview,
          lapse_count: c.lapseCount ?? 0,
          is_leech: c.isLeech ?? false,
          updated_at: c.updatedAt ?? new Date().toISOString(),
        }));
        await supabase.from('srs_cards').upsert(rows, {
          onConflict: 'user_id,id',
        });
      }

      // Upsert daily plans
      if (plans.length > 0) {
        const rows = plans.map((p) => ({
          user_id: this.userId!,
          date: p.date,
          modules: p.modules,
          completed: p.completed,
          updated_at: p.updatedAt ?? new Date().toISOString(),
        }));
        await supabase.from('daily_plans').upsert(rows, {
          onConflict: 'user_id,date',
        });
      }

      // Upsert settings
      if (settings.length > 0) {
        const rows = settings.map((s) => ({
          user_id: this.userId!,
          key: s.key,
          value: s.value,
          updated_at: s.updatedAt ?? new Date().toISOString(),
        }));
        await supabase.from('user_settings').upsert(rows, {
          onConflict: 'user_id,key',
        });
      }

      this._lastSyncedAt = new Date().toISOString();
    } catch (err) {
      console.error('[sync] push failed:', err);
    }
  }

  async pullFromCloud(): Promise<void> {
    if (!supabase || !this.userId) return;

    try {
      const [
        { data: cloudProgress },
        { data: cloudCards },
        { data: cloudPlans },
        { data: cloudSettings },
      ] = await Promise.all([
        supabase.from('module_progress').select('*').eq('user_id', this.userId),
        supabase.from('srs_cards').select('*').eq('user_id', this.userId),
        supabase.from('daily_plans').select('*').eq('user_id', this.userId),
        supabase.from('user_settings').select('*').eq('user_id', this.userId),
      ]);

      // Merge module progress (latest updatedAt wins)
      if (cloudProgress) {
        const localProgress = await db.moduleProgress.toArray();
        const localMap = new Map(localProgress.map((p) => [p.moduleId, p]));

        for (const cp of cloudProgress) {
          const local = localMap.get(cp.module_id);
          const cloudTime = cp.updated_at ?? '';
          const localTime = local?.updatedAt ?? '';

          if (!local || cloudTime > localTime) {
            await db.moduleProgress.put({
              moduleId: cp.module_id,
              status: cp.status,
              score: cp.score,
              completedAt: cp.completed_at,
              attempts: cp.attempts,
              updatedAt: cp.updated_at,
              userId: this.userId,
            });
          }
        }
      }

      // Merge SRS cards
      if (cloudCards) {
        const localCards = await db.srsCards.toArray();
        const localMap = new Map(localCards.map((c) => [c.id, c]));

        for (const cc of cloudCards) {
          const local = localMap.get(cc.id);
          const cloudTime = cc.updated_at ?? '';
          const localTime = local?.updatedAt ?? '';

          if (!local || cloudTime > localTime) {
            await db.srsCards.put({
              id: cc.id,
              itemId: cc.item_id,
              moduleId: cc.module_id,
              contentType: cc.content_type,
              interval: cc.interval,
              repetitions: cc.repetitions,
              easeFactor: cc.ease_factor,
              nextReview: cc.next_review,
              lastReview: cc.last_review,
              lapseCount: cc.lapse_count ?? 0,
              isLeech: cc.is_leech ?? false,
              updatedAt: cc.updated_at,
              userId: this.userId,
            });
          }
        }
      }

      // Merge daily plans
      if (cloudPlans) {
        const localPlans = await db.dailyPlan.toArray();
        const localMap = new Map(localPlans.map((p) => [p.date, p]));

        for (const cp of cloudPlans) {
          const local = localMap.get(cp.date);
          const cloudTime = cp.updated_at ?? '';
          const localTime = local?.updatedAt ?? '';

          if (!local || cloudTime > localTime) {
            await db.dailyPlan.put({
              date: cp.date,
              modules: cp.modules,
              completed: cp.completed,
              updatedAt: cp.updated_at,
              userId: this.userId,
            });
          }
        }
      }

      // Merge settings
      if (cloudSettings) {
        const localSettings = await db.settings.toArray();
        const localMap = new Map(localSettings.map((s) => [s.key, s]));

        for (const cs of cloudSettings) {
          const local = localMap.get(cs.key);
          const cloudTime = cs.updated_at ?? '';
          const localTime = local?.updatedAt ?? '';

          if (!local || cloudTime > localTime) {
            await db.settings.put({
              key: cs.key,
              value: cs.value,
              updatedAt: cs.updated_at,
              userId: this.userId,
            });
          }
        }
      }

      this._lastSyncedAt = new Date().toISOString();
    } catch (err) {
      console.error('[sync] pull failed:', err);
    }
  }

  async fullSync(): Promise<void> {
    await this.pullFromCloud();
    await this.pushToCloud();
  }

  async syncNow(): Promise<void> {
    await this.fullSync();
  }
}

export const syncService = new SyncService();
