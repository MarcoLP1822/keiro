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

  it('multiple freezes used in sequence', () => {
    // Day 1-5 studied, day 6 missed, day 7 studied (freeze 1), day 8 missed, day 9 studied (freeze 2)
    let streak = makeStreak({
      currentStreak: 5,
      longestStreak: 5,
      lastStudyDate: '2026-01-05',
      freezesAvailable: 2,
    });
    // Skip day 6, study day 7 -> freeze used
    const r1 = updateStreak(streak, '2026-01-07');
    expect(r1.freezeUsed).toBe(true);
    expect(r1.data.currentStreak).toBe(6);
    expect(r1.data.freezesAvailable).toBe(1);

    // Skip day 8, study day 9 -> freeze used
    const r2 = updateStreak(r1.data, '2026-01-09');
    expect(r2.freezeUsed).toBe(true);
    expect(r2.data.currentStreak).toBe(7);
    expect(r2.data.freezesAvailable).toBe(1); // earned one at day 7 milestone
  });

  it('freeze earned exactly on day 7, 14, 21', () => {
    // Build up to day 6, then day 7 earns freeze
    let streak = makeStreak({
      currentStreak: 6,
      lastStudyDate: '2026-01-06',
      freezesAvailable: 0,
    });
    const r7 = updateStreak(streak, '2026-01-07');
    expect(r7.data.currentStreak).toBe(7);
    expect(r7.freezeEarned).toBe(true);
    expect(r7.data.freezesAvailable).toBe(1);

    // Build to day 14
    streak = makeStreak({
      currentStreak: 13,
      lastStudyDate: '2026-01-13',
      freezesAvailable: 1,
    });
    const r14 = updateStreak(streak, '2026-01-14');
    expect(r14.data.currentStreak).toBe(14);
    expect(r14.freezeEarned).toBe(true);
    expect(r14.data.freezesAvailable).toBe(2);

    // Build to day 21
    streak = makeStreak({
      currentStreak: 20,
      lastStudyDate: '2026-01-20',
      freezesAvailable: 2,
    });
    const r21 = updateStreak(streak, '2026-01-21');
    expect(r21.data.currentStreak).toBe(21);
    expect(r21.freezeEarned).toBe(true);
    expect(r21.data.freezesAvailable).toBe(3);
  });

  it('max 3 freezes cap enforced even across multiple milestones', () => {
    // At day 28 milestone with already 3 freezes
    const streak = makeStreak({
      currentStreak: 27,
      lastStudyDate: '2026-01-27',
      freezesAvailable: 3,
    });
    const result = updateStreak(streak, '2026-01-28');
    expect(result.data.currentStreak).toBe(28);
    expect(result.freezeEarned).toBe(false);
    expect(result.data.freezesAvailable).toBe(3);
  });

  it('longestStreak updates correctly when current beats it', () => {
    const streak = makeStreak({
      currentStreak: 14,
      longestStreak: 14,
      lastStudyDate: '2026-01-14',
    });
    const r1 = updateStreak(streak, '2026-01-15');
    expect(r1.data.currentStreak).toBe(15);
    expect(r1.data.longestStreak).toBe(15);

    const r2 = updateStreak(r1.data, '2026-01-16');
    expect(r2.data.currentStreak).toBe(16);
    expect(r2.data.longestStreak).toBe(16);

    // After reset, longestStreak preserved
    const r3 = updateStreak(r2.data, '2026-01-25');
    expect(r3.data.currentStreak).toBe(1);
    expect(r3.data.longestStreak).toBe(16);
  });
});
