import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateKanjiExercises } from '../src/exercises.js';
import type { Module, KanjiItem } from '@keiro/types';

const kanjiPool: KanjiItem[] = [
  {
    kanji: '一',
    meanings: ['One'],
    onReading: ['いち', 'いつ'],
    kunReading: ['ひと'],
    strokeCount: 1,
  },
  {
    kanji: '二',
    meanings: ['Two'],
    onReading: ['に'],
    kunReading: ['ふた'],
    strokeCount: 2,
  },
  {
    kanji: '三',
    meanings: ['Three'],
    onReading: ['さん'],
    kunReading: ['み'],
    strokeCount: 3,
  },
  {
    kanji: '四',
    meanings: ['Four'],
    onReading: ['し'],
    kunReading: ['よ', 'よん'],
    strokeCount: 5,
  },
  {
    kanji: '五',
    meanings: ['Five'],
    onReading: ['ご'],
    kunReading: ['いつ'],
    strokeCount: 4,
  },
  {
    kanji: '大',
    meanings: ['Big', 'Large'],
    onReading: ['だい', 'たい'],
    kunReading: ['おお'],
    strokeCount: 3,
  },
];

function makeModule(items: KanjiItem[]): Module {
  return {
    id: 'test-kanji-mod',
    name: 'Test Kanji',
    type: 'kanji',
    level: 'n5',
    order: 2500,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

describe('generateKanjiExercises', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('produces kanji-to-meaning exercises', () => {
    const mod = makeModule(kanjiPool.slice(0, 3));
    const exercises = generateKanjiExercises(mod, kanjiPool);
    const k2m = exercises.filter((e) => e.type === 'kanji-to-meaning');
    expect(k2m.length).toBe(3);
    for (const ex of k2m) {
      const target = ex.targetItem as KanjiItem;
      expect(ex.question).toBe(target.kanji);
      expect(ex.options[ex.correctIndex]).toBe(target.meanings[0]);
    }
  });

  it('produces kanji-to-reading exercises', () => {
    const mod = makeModule(kanjiPool.slice(0, 3));
    const exercises = generateKanjiExercises(mod, kanjiPool);
    const k2r = exercises.filter((e) => e.type === 'kanji-to-reading');
    expect(k2r.length).toBe(3);
    for (const ex of k2r) {
      const target = ex.targetItem as KanjiItem;
      const allReadings = [...target.kunReading, ...target.onReading];
      expect(ex.question).toBe(target.kanji);
      expect(allReadings).toContain(ex.options[ex.correctIndex]);
    }
  });

  it('typing-reading exercises are generated', () => {
    randomSpy.mockReturnValue(0.1);
    const mod = makeModule(kanjiPool.slice(0, 3));
    const exercises = generateKanjiExercises(mod, kanjiPool);
    const typingExercises = exercises.filter((e) => e.type === 'typing-reading');
    expect(typingExercises.length).toBeGreaterThan(0);
    for (const te of typingExercises) {
      const target = te.targetItem as KanjiItem;
      const allReadings = [...target.kunReading, ...target.onReading];
      expect(te.correctAnswer).toBeDefined();
      expect(allReadings).toContain(te.correctAnswer);
      expect(te.correctIndex).toBe(-1);
    }
  });

  it('correct readings/meanings are in options', () => {
    const mod = makeModule(kanjiPool.slice(0, 4));
    const exercises = generateKanjiExercises(mod, kanjiPool);
    for (const ex of exercises) {
      if (ex.type === 'kanji-to-meaning' || ex.type === 'kanji-to-reading') {
        expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
        expect(ex.correctIndex).toBeLessThan(ex.options.length);
        expect(ex.options[ex.correctIndex]).toBeDefined();
      }
    }
  });

  it('handles kanji with single reading', () => {
    const singleReadingKanji: KanjiItem = {
      kanji: '七',
      meanings: ['Seven'],
      onReading: ['しち'],
      kunReading: [],
      strokeCount: 2,
    };
    const pool = [singleReadingKanji, ...kanjiPool];
    const mod = makeModule([singleReadingKanji]);
    const exercises = generateKanjiExercises(mod, pool);
    const k2r = exercises.filter((e) => e.type === 'kanji-to-reading');
    expect(k2r.length).toBe(1);
    expect(k2r[0].options[k2r[0].correctIndex]).toBe('しち');
  });

  it('returns empty array for module with no items', () => {
    const mod = makeModule([]);
    const exercises = generateKanjiExercises(mod, kanjiPool);
    expect(exercises).toEqual([]);
  });

  it('each MC exercise has 4 unique options with sufficient pool', () => {
    const mod = makeModule(kanjiPool.slice(0, 3));
    const exercises = generateKanjiExercises(mod, kanjiPool);
    const mcExercises = exercises.filter(
      (e) => e.type === 'kanji-to-meaning' || e.type === 'kanji-to-reading',
    );
    for (const ex of mcExercises) {
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4);
    }
  });
});
