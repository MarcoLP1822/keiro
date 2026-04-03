import { describe, it, expect } from 'vitest';
import { calculateDailyPlan, getCurrentModule } from '../src/daily-plan.js';
import type { Module, ModuleProgress } from '@keiro/types';

function makeModule(id: string, order: number, itemCount = 5): Module {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    character: `char${i}`,
    romaji: `rom${i}`,
  }));
  return {
    id,
    name: `Module ${id}`,
    type: 'kana',
    level: 'beginner',
    order,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

function makeProgress(moduleId: string, status: 'passed' | 'available' = 'passed'): ModuleProgress {
  return {
    moduleId,
    status,
    score: status === 'passed' ? 100 : null,
    completedAt: status === 'passed' ? '2026-01-01' : null,
    attempts: status === 'passed' ? 1 : 0,
  };
}

const modules = [
  makeModule('mod-1', 1),
  makeModule('mod-2', 2),
  makeModule('mod-3', 3),
];

describe('calculateDailyPlan', () => {
  it('small plan returns correct max exercises (10)', () => {
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
    });
    // 5 items * 2 exercises = 10, capped at 10
    expect(result.modules).toContain('mod-1');
    expect(result.isComplete).toBe(false);
  });

  it('medium plan returns correct max (20)', () => {
    const result = calculateDailyPlan({
      size: 'medium',
      progressMap: new Map(),
      allModules: modules,
    });
    expect(result.isComplete).toBe(false);
    expect(result.modules).toContain('mod-1');
  });

  it('large plan returns correct max (30)', () => {
    const result = calculateDailyPlan({
      size: 'large',
      progressMap: new Map(),
      allModules: modules,
    });
    expect(result.isComplete).toBe(false);
    expect(result.modules).toContain('mod-1');
  });

  it('returns current module when partially complete', () => {
    const progressMap = new Map<string, ModuleProgress>();
    progressMap.set('mod-1', makeProgress('mod-1', 'passed'));

    const result = calculateDailyPlan({
      size: 'small',
      progressMap,
      allModules: modules,
    });
    expect(result.modules).toContain('mod-2');
    expect(result.isComplete).toBe(false);
  });

  it('returns isComplete true when all modules passed', () => {
    const progressMap = new Map<string, ModuleProgress>();
    modules.forEach((m) => progressMap.set(m.id, makeProgress(m.id, 'passed')));

    const result = calculateDailyPlan({
      size: 'small',
      progressMap,
      allModules: modules,
    });
    expect(result.isComplete).toBe(true);
    expect(result.modules).toEqual([]);
  });

  it('empty progress starts at first module', () => {
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
    });
    expect(result.modules).toContain('mod-1');
  });
});

describe('getCurrentModule', () => {
  it('returns first module with empty progress', () => {
    const result = getCurrentModule(modules, new Map());
    expect(result?.id).toBe('mod-1');
  });

  it('returns null when all passed', () => {
    const progressMap = new Map<string, ModuleProgress>();
    modules.forEach((m) => progressMap.set(m.id, makeProgress(m.id, 'passed')));
    const result = getCurrentModule(modules, progressMap);
    expect(result).toBeNull();
  });
});

function makeSrsCard(id: string, nextReview: string): import('@keiro/types').SrsCard {
  return {
    id,
    itemId: id,
    moduleId: 'mod-1',
    contentType: 'vocabulary',
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReview,
    lastReview: null,
    lapseCount: 0,
    isLeech: false,
  };
}

describe('calculateDailyPlan with SRS', () => {
  it('when dueCards exist, reviews are included in plan', () => {
    const dueCards = [
      makeSrsCard('card-1', '2026-01-01'),
      makeSrsCard('card-2', '2026-01-01'),
    ];
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCount).toBe(2);
    expect(result.reviewCards).toEqual(['card-1', 'card-2']);
    expect(result.isComplete).toBe(false);
  });

  it('review cap is enforced for small (15)', () => {
    const dueCards = Array.from({ length: 20 }, (_, i) =>
      makeSrsCard(`card-${i}`, '2026-01-01'),
    );
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCount).toBe(15);
    expect(result.reviewCards).toHaveLength(15);
  });

  it('review cap is enforced for medium (30)', () => {
    const dueCards = Array.from({ length: 35 }, (_, i) =>
      makeSrsCard(`card-${i}`, '2026-01-01'),
    );
    const result = calculateDailyPlan({
      size: 'medium',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCount).toBe(30);
    expect(result.reviewCards).toHaveLength(30);
  });

  it('review cap is enforced for large (50)', () => {
    const dueCards = Array.from({ length: 60 }, (_, i) =>
      makeSrsCard(`card-${i}`, '2026-01-01'),
    );
    const result = calculateDailyPlan({
      size: 'large',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCount).toBe(50);
    expect(result.reviewCards).toHaveLength(50);
  });

  it('reviews take priority over new items', () => {
    // For small: maxExercises=10. If we have 10 reviews, no capacity for new items
    const dueCards = Array.from({ length: 10 }, (_, i) =>
      makeSrsCard(`card-${i}`, '2026-01-01'),
    );
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCount).toBe(10);
    expect(result.newItemCount).toBe(0);
  });

  it('when reviews fill the whole session, no new items', () => {
    const dueCards = Array.from({ length: 15 }, (_, i) =>
      makeSrsCard(`card-${i}`, '2026-01-01'),
    );
    const result = calculateDailyPlan({
      size: 'small',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    // 15 reviews > maxExercises(10), so remaining capacity = 0
    expect(result.newItemCount).toBe(0);
    expect(result.reviewCount).toBe(15);
  });

  it('reviewCards array contains correct card IDs', () => {
    const dueCards = [
      makeSrsCard('alpha', '2026-01-01'),
      makeSrsCard('beta', '2026-01-01'),
      makeSrsCard('gamma', '2026-01-01'),
    ];
    const result = calculateDailyPlan({
      size: 'medium',
      progressMap: new Map(),
      allModules: modules,
      dueCards,
    });
    expect(result.reviewCards).toEqual(['alpha', 'beta', 'gamma']);
  });
});
