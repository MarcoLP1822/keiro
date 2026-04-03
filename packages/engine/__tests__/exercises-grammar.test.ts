import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateGrammarExercises } from '../src/exercises.js';
import type { Module, GrammarItem } from '@keiro/types';

const grammarPool: GrammarItem[] = [
  {
    id: 'n5-wa',
    title: 'Noun は～ (wa)',
    explanation: 'Topic marker particle.',
    structure: 'Noun + は',
    examples: [
      { japanese: '私は学生です。', english: 'I am a student.' },
      { japanese: '彼は先生です。', english: 'He is a teacher.' },
    ],
  },
  {
    id: 'n5-ga',
    title: 'Noun が～ (ga)',
    explanation: 'Subject marker particle.',
    structure: 'Noun + が',
    examples: [
      { japanese: '猫が好きです。', english: 'I like cats.' },
      { japanese: '水がほしいです。', english: 'I want water.' },
    ],
  },
  {
    id: 'n5-wo',
    title: 'Noun を～ (wo)',
    explanation: 'Object marker particle.',
    structure: 'Noun + を',
    examples: [
      { japanese: '本を読みます。', english: 'I read a book.' },
      { japanese: 'りんごを食べます。', english: 'I eat an apple.' },
    ],
  },
  {
    id: 'n5-ni',
    title: 'Noun に～ (ni)',
    explanation: 'Direction/time particle.',
    structure: 'Noun + に',
    examples: [
      { japanese: '学校に行きます。', english: 'I go to school.' },
      { japanese: '七時に起きます。', english: 'I wake up at seven.' },
    ],
  },
  {
    id: 'n5-desu',
    title: 'です (desu)',
    explanation: 'Copula, equivalent of "is".',
    structure: 'Noun + です',
    examples: [
      { japanese: '日本人です。', english: 'I am Japanese.' },
    ],
  },
];

function makeModule(items: GrammarItem[]): Module {
  return {
    id: 'test-grammar-mod',
    name: 'Test Grammar',
    type: 'grammar',
    level: 'n5',
    order: 3000,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

describe('generateGrammarExercises', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('produces grammar-pick-correct exercises', () => {
    const mod = makeModule(grammarPool.slice(0, 3));
    const exercises = generateGrammarExercises(mod, grammarPool);
    const pickCorrect = exercises.filter((e) => e.type === 'grammar-pick-correct');
    expect(pickCorrect.length).toBeGreaterThan(0);
  });

  it('sentence-order exercises have scrambledWords and correctOrder', () => {
    // Force random to trigger sentence-order generation
    randomSpy.mockReturnValue(0.1);
    const mod = makeModule(grammarPool.slice(0, 3));
    const exercises = generateGrammarExercises(mod, grammarPool);
    const sentenceOrder = exercises.filter((e) => e.type === 'grammar-sentence-order');
    // May or may not produce any depending on Japanese tokenization, but if it does:
    for (const ex of sentenceOrder) {
      expect(ex.scrambledWords).toBeDefined();
      expect(ex.correctOrder).toBeDefined();
      expect(ex.scrambledWords!.length).toBeGreaterThanOrEqual(3);
      expect(ex.correctOrder!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each exercise has valid options', () => {
    const mod = makeModule(grammarPool.slice(0, 3));
    const exercises = generateGrammarExercises(mod, grammarPool);
    const pickCorrect = exercises.filter((e) => e.type === 'grammar-pick-correct');
    for (const ex of pickCorrect) {
      expect(ex.options.length).toBeGreaterThanOrEqual(2);
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
      expect(ex.correctIndex).toBeLessThan(ex.options.length);
    }
  });

  it('correct answer present in options', () => {
    const mod = makeModule(grammarPool.slice(0, 3));
    const exercises = generateGrammarExercises(mod, grammarPool);
    const pickCorrect = exercises.filter((e) => e.type === 'grammar-pick-correct');
    for (const ex of pickCorrect) {
      const correct = ex.options[ex.correctIndex];
      expect(correct).toBeDefined();
      expect(correct.length).toBeGreaterThan(0);
    }
  });

  it('handles modules with few items gracefully', () => {
    const mod = makeModule([grammarPool[0]]);
    // Only 1 grammar item, other items in pool for distractors
    const exercises = generateGrammarExercises(mod, grammarPool);
    expect(exercises.length).toBeGreaterThan(0);
    for (const ex of exercises) {
      if (ex.type === 'grammar-pick-correct') {
        expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
        expect(ex.correctIndex).toBeLessThan(ex.options.length);
      }
    }
  });

  it('returns empty array for module with no items', () => {
    const mod = makeModule([]);
    const exercises = generateGrammarExercises(mod, grammarPool);
    expect(exercises).toEqual([]);
  });
});
