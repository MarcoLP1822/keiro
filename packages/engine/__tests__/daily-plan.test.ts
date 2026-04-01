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
