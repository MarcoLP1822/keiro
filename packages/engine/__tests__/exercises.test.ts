import { describe, it, expect } from 'vitest';
import {
  createMultipleChoice,
  generateKanaExercises,
  generateAudioExercises,
} from '../src/exercises.js';
import type { Module, KanaItem } from '@keiro/types';

const kanaPool: KanaItem[] = [
  { character: 'あ', romaji: 'a' },
  { character: 'い', romaji: 'i' },
  { character: 'う', romaji: 'u' },
  { character: 'え', romaji: 'e' },
  { character: 'お', romaji: 'o' },
  { character: 'か', romaji: 'ka' },
  { character: 'き', romaji: 'ki' },
  { character: 'く', romaji: 'ku' },
];

function makeModule(items: KanaItem[]): Module {
  return {
    id: 'test-mod',
    name: 'Test',
    type: 'kana',
    level: 'beginner',
    order: 1,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

describe('createMultipleChoice', () => {
  it('each exercise has exactly 4 unique options', () => {
    const target = kanaPool[0];
    const exercise = createMultipleChoice('char-to-romaji', target, kanaPool);
    expect(exercise.options).toHaveLength(4);
    expect(new Set(exercise.options).size).toBe(4);
  });

  it('correct answer is always among options', () => {
    const target = kanaPool[0];
    const exercise = createMultipleChoice('char-to-romaji', target, kanaPool);
    expect(exercise.options[exercise.correctIndex]).toBe(target.romaji);
  });

  it('no duplicate distractors', () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 20; i++) {
      const target = kanaPool[i % kanaPool.length];
      const exercise = createMultipleChoice('char-to-romaji', target, kanaPool);
      const uniqueOptions = new Set(exercise.options);
      expect(uniqueOptions.size).toBe(exercise.options.length);
    }
  });

  it('handles modules with small item counts (fewer than 4)', () => {
    const smallPool: KanaItem[] = [
      { character: 'あ', romaji: 'a' },
      { character: 'い', romaji: 'i' },
    ];
    const exercise = createMultipleChoice('char-to-romaji', smallPool[0], smallPool);
    // Should have target + 1 distractor = 2 options
    expect(exercise.options.length).toBe(2);
    expect(exercise.options[exercise.correctIndex]).toBe('a');
  });
});

describe('generateKanaExercises', () => {
  it('generates exercises for each item in the module', () => {
    const items = kanaPool.slice(0, 3);
    const mod = makeModule(items);
    const exercises = generateKanaExercises(mod, kanaPool);
    // 3 items * 2 types = 6 exercises
    expect(exercises).toHaveLength(6);
  });

  it('returns empty array for module with no items', () => {
    const mod = makeModule([]);
    const exercises = generateKanaExercises(mod, kanaPool);
    expect(exercises).toEqual([]);
  });
});

describe('generateAudioExercises', () => {
  it('produces audio-to-char type exercises', () => {
    const items = kanaPool.slice(0, 3);
    const mod = makeModule(items);
    const exercises = generateAudioExercises(mod, kanaPool);
    expect(exercises).toHaveLength(3);
    expect(exercises.every((e) => e.type === 'audio-to-char')).toBe(true);
  });
});
