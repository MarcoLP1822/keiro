import { describe, it, expect } from 'vitest';
import { updateStreak, createDefaultStreakData } from '../src/streak.js';
import type { StreakData } from '@keiro/types';

function makeStreak(overrides: Partial<StreakData> = {}): StreakData {
  return { ...createDefaultStreakData(), ...overrides };
}

describe('updateStreak', () => {
  it('starts a new streak on first ever study', () => {
    const { data } = updateStreak(createDefaultStreakData(), '2026-01-01');
    expect(data.currentStreak).toBe(1);
    expect(data.lastStudyDate).toBe('2026-01-01');
    expect(data.longestStreak).toBe(1);
  });

  it('does nothing if already studied today', () => {
    const current = makeStreak({ currentStreak: 3, lastStudyDate: '2026-01-05' });
    const { data } = updateStreak(current, '2026-01-05');
    expect(data).toBe(current); // same reference, no change
  });

  it('increments streak on consecutive day', () => {
    const current = makeStreak({ currentStreak: 3, lastStudyDate: '2026-01-04' });
    const { data } = updateStreak(current, '2026-01-05');
    expect(data.currentStreak).toBe(4);
    expect(data.lastStudyDate).toBe('2026-01-05');
  });

  it('uses a freeze when missing exactly one day', () => {
    const current = makeStreak({
      currentStreak: 5,
      lastStudyDate: '2026-01-03',
      freezesAvailable: 2,
    });
    const { data, freezeUsed } = updateStreak(current, '2026-01-05');
    expect(data.currentStreak).toBe(6);
    expect(data.freezesAvailable).toBe(1);
    expect(freezeUsed).toBe(true);
    // The missed day (the day after lastStudyDate) is recorded
    expect(data.freezesUsed).toContain('2026-01-03');
  });

  it('resets streak when missing one day with no freezes', () => {
    const current = makeStreak({
      currentStreak: 5,
      lastStudyDate: '2026-01-03',
      freezesAvailable: 0,
    });
    const { data, freezeUsed } = updateStreak(current, '2026-01-05');
    expect(data.currentStreak).toBe(1);
    expect(freezeUsed).toBe(false);
  });

  it('resets streak when missing more than one day even with freezes', () => {
    const current = makeStreak({
      currentStreak: 10,
      lastStudyDate: '2026-01-01',
      freezesAvailable: 3,
    });
    const { data } = updateStreak(current, '2026-01-04'); // 3-day gap
    expect(data.currentStreak).toBe(1);
    expect(data.freezesAvailable).toBe(3); // freeze not consumed
  });

  it('updates longestStreak when current exceeds it', () => {
    const current = makeStreak({
      currentStreak: 9,
      longestStreak: 9,
      lastStudyDate: '2026-01-09',
    });
    const { data } = updateStreak(current, '2026-01-10');
    expect(data.longestStreak).toBe(10);
  });

  it('preserves longestStreak when streak resets', () => {
    const current = makeStreak({
      currentStreak: 3,
      longestStreak: 15,
      lastStudyDate: '2026-01-01',
    });
    const { data } = updateStreak(current, '2026-01-10');
    expect(data.longestStreak).toBe(15);
    expect(data.currentStreak).toBe(1);
  });

  it('earns a freeze at 7-day milestone', () => {
    const current = makeStreak({
      currentStreak: 6,
      lastStudyDate: '2026-01-06',
      freezesAvailable: 0,
    });
    const { data, freezeEarned } = updateStreak(current, '2026-01-07');
    expect(data.currentStreak).toBe(7);
    expect(data.freezesAvailable).toBe(1);
    expect(freezeEarned).toBe(true);
  });

  it('earns a freeze at 14-day milestone', () => {
    const current = makeStreak({
      currentStreak: 13,
      lastStudyDate: '2026-01-13',
      freezesAvailable: 1,
    });
    const { data, freezeEarned } = updateStreak(current, '2026-01-14');
    expect(data.currentStreak).toBe(14);
    expect(data.freezesAvailable).toBe(2);
    expect(freezeEarned).toBe(true);
  });

  it('caps freezes at 3', () => {
    const current = makeStreak({
      currentStreak: 6,
      lastStudyDate: '2026-01-06',
      freezesAvailable: 3,
    });
    const { data, freezeEarned } = updateStreak(current, '2026-01-07');
    expect(data.currentStreak).toBe(7);
    expect(data.freezesAvailable).toBe(3);
    expect(freezeEarned).toBe(false);
  });
});
