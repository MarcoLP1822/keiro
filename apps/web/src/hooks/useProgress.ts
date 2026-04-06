import { useLiveQuery } from 'dexie-react-hooks';
import type { ModuleProgress } from '@keiro/types';
import { db } from '../services/db';
import { storage } from '../services/storage';

export function useProgress() {
  const allProgress = useLiveQuery(() => db.moduleProgress.toArray()) ?? [];

  function getProgress(moduleId: string): ModuleProgress | undefined {
    return allProgress.find((p) => p.moduleId === moduleId);
  }

  async function updateProgress(progress: ModuleProgress): Promise<void> {
    await storage.saveModuleProgress(progress);
  }

  return { allProgress, getProgress, updateProgress };
}
