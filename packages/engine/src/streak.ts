import type { StreakData } from '@keiro/types';

const MAX_FREEZES = 3;
const FREEZE_EARN_INTERVAL = 7;

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00Z');
  const b = new Date(dateB + 'T00:00:00Z');
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function createDefaultStreakData(): StreakData {
  return {
    id: 'current',
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    freezesAvailable: 0,
    freezesUsed: [],
  };
}

/**
 * Pure function: compute the next streak state when a user completes their daily plan.
 * Returns the updated StreakData plus metadata about what changed.
 */
export function updateStreak(
  current: StreakData,
  today: string,
): { data: StreakData; freezeUsed: boolean; freezeEarned: boolean } {
  // Already studied today — no change
  if (current.lastStudyDate === today) {
    return { data: current, freezeUsed: false, freezeEarned: false };
  }

  let newStreak: number;
  let freezeUsed = false;

  if (current.lastStudyDate === null) {
    // First day ever
    newStreak = 1;
  } else {
    const gap = daysBetween(today, current.lastStudyDate);

    if (gap === 1) {
      // Consecutive day
      newStreak = current.currentStreak + 1;
    } else if (gap === 2 && current.freezesAvailable > 0) {
      // Missed exactly one day, use a freeze
      freezeUsed = true;
      newStreak = current.currentStreak + 1;
    } else {
      // Streak broken — start fresh
      newStreak = 1;
    }
  }

  const freezesAvailable = freezeUsed
    ? current.freezesAvailable - 1
    : current.freezesAvailable;

  const freezesUsed = freezeUsed
    ? [...current.freezesUsed, current.lastStudyDate!]
    : current.freezesUsed;

  // Award a freeze every 7 consecutive days (check if we just crossed a multiple of 7)
  const freezeEarned =
    newStreak >= FREEZE_EARN_INTERVAL &&
    newStreak % FREEZE_EARN_INTERVAL === 0 &&
    freezesAvailable < MAX_FREEZES;

  const finalFreezes = freezeEarned
    ? Math.min(freezesAvailable + 1, MAX_FREEZES)
    : freezesAvailable;

  const longestStreak = Math.max(current.longestStreak, newStreak);

  return {
    data: {
      id: 'current',
      currentStreak: newStreak,
      longestStreak,
      lastStudyDate: today,
      freezesAvailable: finalFreezes,
      freezesUsed,
    },
    freezeUsed,
    freezeEarned,
  };
}
