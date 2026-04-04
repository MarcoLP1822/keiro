import { useLiveQuery } from 'dexie-react-hooks';
import type { PlanSize } from '@keiro/engine';
import { db } from '../services/db';
import { storage } from '../services/storage';
import { requestPermission } from '../services/notifications';

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.toArray()) ?? [];

  function getSetting<T>(key: string, defaultValue: T): T {
    const found = settings.find((s) => s.key === key);
    return found ? (found.value as T) : defaultValue;
  }

  const audio = getSetting<boolean>('audio', true);
  const planSize = getSetting<PlanSize>('planSize', 'medium');
  const reminderEnabled = getSetting<boolean>('reminderEnabled', false);
  const reminderTime = getSetting<string>('reminderTime', '20:00');
  const theme = getSetting<'system' | 'light' | 'dark'>('theme', 'system');
  const showFurigana = getSetting<boolean>('showFurigana', true);

  async function setAudio(value: boolean): Promise<void> {
    await storage.setSetting('audio', value);
  }

  async function setPlanSize(value: PlanSize): Promise<void> {
    await storage.setSetting('planSize', value);
  }

  async function setReminderEnabled(value: boolean): Promise<void> {
    if (value) {
      const granted = await requestPermission();
      if (!granted) return; // Don't enable if permission not granted
    }
    await storage.setSetting('reminderEnabled', value);
  }

  async function setReminderTime(value: string): Promise<void> {
    await storage.setSetting('reminderTime', value);
  }

  async function setTheme(value: 'system' | 'light' | 'dark'): Promise<void> {
    await storage.setSetting('theme', value);
  }

  async function setShowFurigana(value: boolean): Promise<void> {
    await storage.setSetting('showFurigana', value);
  }

  return {
    audio,
    planSize,
    reminderEnabled,
    reminderTime,
    theme,
    showFurigana,
    setAudio,
    setPlanSize,
    setReminderEnabled,
    setReminderTime,
    setTheme,
    setShowFurigana,
  };
}
