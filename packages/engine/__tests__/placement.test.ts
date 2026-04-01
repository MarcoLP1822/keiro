import { describe, it, expect } from 'vitest';
import { generatePlacementQuiz, evaluatePlacement } from '../src/placement.js';
import type { Module, KanaItem, Answer, Exercise } from '@keiro/types';

function makeKanaModule(
  id: string,
  order: number,
  items: KanaItem[],
): Module {
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

const hiraganaModules = [
  makeKanaModule('hiragana-vowels', 1, [
    { character: 'あ', romaji: 'a' },
    { character: 'い', romaji: 'i' },
    { character: 'う', romaji: 'u' },
    { character: 'え', romaji: 'e' },
    { character: 'お', romaji: 'o' },
  ]),
  makeKanaModule('hiragana-k', 2, [
    { character: 'か', romaji: 'ka' },
    { character: 'き', romaji: 'ki' },
    { character: 'く', romaji: 'ku' },
    { character: 'け', romaji: 'ke' },
    { character: 'こ', romaji: 'ko' },
  ]),
];

const katakanaModules = [
  makeKanaModule('katakana-vowels', 11, [
    { character: 'ア', romaji: 'a' },
    { character: 'イ', romaji: 'i' },
    { character: 'ウ', romaji: 'u' },
    { character: 'エ', romaji: 'e' },
    { character: 'オ', romaji: 'o' },
  ]),
  makeKanaModule('katakana-k', 12, [
    { character: 'カ', romaji: 'ka' },
    { character: 'キ', romaji: 'ki' },
    { character: 'ク', romaji: 'ku' },
    { character: 'ケ', romaji: 'ke' },
    { character: 'コ', romaji: 'ko' },
  ]),
];

const allModules = [...hiraganaModules, ...katakanaModules];
const allKanaItems: KanaItem[] = allModules.flatMap((m) => m.items as KanaItem[]);

function makeAnswer(isCorrect: boolean, index: number): Answer {
  const exercise: Exercise = {
    type: 'char-to-romaji',
    question: 'あ',
    options: ['a', 'i', 'u', 'e'],
    correctIndex: 0,
    targetItem: { character: 'あ', romaji: 'a' },
  };
  return {
    exerciseIndex: index,
    selectedIndex: isCorrect ? 0 : 1,
    isCorrect,
    exercise,
  };
}

function makePlacementAnswers(
  hiraganaCorrect: number,
  katakanaCorrect: number,
): Answer[] {
  const answers: Answer[] = [];
  for (let i = 0; i < 5; i++) {
    answers.push(makeAnswer(i < hiraganaCorrect, i));
  }
  for (let i = 0; i < 5; i++) {
    answers.push(makeAnswer(i < katakanaCorrect, i + 5));
  }
  return answers;
}

describe('generatePlacementQuiz', () => {
  it('returns exactly 10 exercises (5 hiragana + 5 katakana)', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems);
    expect(exercises).toHaveLength(10);
    // All should be char-to-romaji type
    expect(exercises.every((e) => e.type === 'char-to-romaji')).toBe(true);
  });
});

describe('evaluatePlacement', () => {
  it('passing all kana marks all modules as passed', () => {
    const answers = makePlacementAnswers(5, 5);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toEqual(
      expect.arrayContaining(allModules.map((m) => m.id)),
    );
    expect(result.passedModuleIds).toHaveLength(allModules.length);
    // All passed - startModuleId should be last module id (edge case)
    expect(result.startModuleId).toBe('katakana-k');
  });

  it('passing hiragana only marks only hiragana modules as passed', () => {
    const answers = makePlacementAnswers(5, 0);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toEqual(
      hiraganaModules.map((m) => m.id),
    );
    // Should start at first katakana module
    expect(result.startModuleId).toBe('katakana-vowels');
  });

  it('failing all starts at first module with no passed modules', () => {
    const answers = makePlacementAnswers(0, 0);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toEqual([]);
    expect(result.startModuleId).toBe('hiragana-vowels');
  });

  it('passing katakana but not hiragana starts at first hiragana module', () => {
    const answers = makePlacementAnswers(0, 5);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toEqual(
      katakanaModules.map((m) => m.id),
    );
    // First non-passed module is hiragana-vowels (order 1)
    expect(result.startModuleId).toBe('hiragana-vowels');
  });

  it('80% threshold: 4/5 correct passes, 3/5 fails', () => {
    // 4/5 hiragana = 80% passes, 3/5 katakana = 60% fails
    const answers = makePlacementAnswers(4, 3);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toEqual(
      hiraganaModules.map((m) => m.id),
    );
    expect(result.startModuleId).toBe('katakana-vowels');
  });
});
