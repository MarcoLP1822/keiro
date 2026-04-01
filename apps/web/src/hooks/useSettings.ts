import { useLiveQuery } from 'dexie-react-hooks';
import type { PlanSize } from '@keiro/engine';
import { db } from '../services/db';
import { storage } from '../services/storage';

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.toArray()) ?? [];

  function getSetting<T>(key: string, defaultValue: T): T {
    const found = settings.find((s) => s.key === key);
    return found ? (found.value as T) : defaultValue;
  }

  const audio = getSetting<boolean>('audio', true);
  const planSize = getSetting<PlanSize>('planSize', 'medium');

  async function setAudio(value: boolean): Promise<void> {
    await storage.setSetting('audio', value);
  }

  async function setPlanSize(value: PlanSize): Promise<void> {
    await storage.setSetting('planSize', value);
  }

  return { audio, planSize, setAudio, setPlanSize };
}
