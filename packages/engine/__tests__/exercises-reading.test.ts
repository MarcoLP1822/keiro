import { describe, it, expect } from 'vitest';
import { generateReadingExercises } from '../src/exercises.js';
import type { Module, ReadingItem } from '@keiro/types';

const readingItems: ReadingItem[] = [
  {
    passage: 'はじめまして。私はたなかです。日本人です。学生です。',
    translation: 'Nice to meet you. I am Tanaka. I am Japanese. I am a student.',
    questions: [
      {
        question: 'What is the speaker\'s name?',
        options: ['Suzuki', 'Tanaka', 'Yamada', 'Sato'],
        correctIndex: 1,
      },
      {
        question: 'What does the speaker do?',
        options: ['Teacher', 'Student', 'Doctor', 'Office worker'],
        correctIndex: 1,
      },
    ],
  },
  {
    passage: '私はすずきです。アメリカ人です。会社員です。',
    translation: 'I am Suzuki. I am American. I am an office worker.',
    questions: [
      {
        question: 'Where is the speaker from?',
        options: ['Japan', 'America', 'China', 'Korea'],
        correctIndex: 1,
      },
    ],
  },
  {
    passage: '今日は月曜日です。天気は晴れです。',
    translation: 'Today is Monday. The weather is sunny.',
    questions: [
      {
        question: 'What day is it?',
        options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        correctIndex: 1,
      },
    ],
  },
];

function makeModule(items: ReadingItem[]): Module {
  return {
    id: 'test-reading-mod',
    name: 'Test Reading',
    type: 'reading',
    level: 'n5',
    order: 3100,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

describe('generateReadingExercises', () => {
  it('produces reading-comprehension exercises', () => {
    const mod = makeModule(readingItems);
    const exercises = generateReadingExercises(mod);
    const comprehension = exercises.filter((e) => e.type === 'reading-comprehension');
    // Total questions across all items: 2 + 1 + 1 = 4
    expect(comprehension).toHaveLength(4);
  });

  it('produces reading-translation exercises', () => {
    const mod = makeModule(readingItems);
    const exercises = generateReadingExercises(mod);
    const translation = exercises.filter((e) => e.type === 'reading-translation');
    // Each item with at least 1 other item for distractors gets a translation exercise
    expect(translation).toHaveLength(3);
  });

  it('question text contains the passage', () => {
    const mod = makeModule(readingItems);
    const exercises = generateReadingExercises(mod);
    for (const ex of exercises) {
      // The question field is the passage for reading exercises
      const matchingItem = readingItems.find((r) => r.passage === ex.question);
      expect(matchingItem).toBeDefined();
    }
  });

  it('options match the reading questions for comprehension', () => {
    const mod = makeModule(readingItems);
    const exercises = generateReadingExercises(mod);
    const comprehension = exercises.filter((e) => e.type === 'reading-comprehension');
    for (const ex of comprehension) {
      expect(ex.options.length).toBe(4);
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
      expect(ex.correctIndex).toBeLessThan(4);
    }
  });

  it('handles modules with single passage', () => {
    const mod = makeModule([readingItems[0]]);
    const exercises = generateReadingExercises(mod);
    // 2 comprehension questions, 0 translation (no other items for distractors)
    const comprehension = exercises.filter((e) => e.type === 'reading-comprehension');
    const translation = exercises.filter((e) => e.type === 'reading-translation');
    expect(comprehension).toHaveLength(2);
    expect(translation).toHaveLength(0);
  });

  it('returns empty array for module with no items', () => {
    const mod = makeModule([]);
    const exercises = generateReadingExercises(mod);
    expect(exercises).toEqual([]);
  });

  it('translation exercises have correct answer in options', () => {
    const mod = makeModule(readingItems);
    const exercises = generateReadingExercises(mod);
    const translation = exercises.filter((e) => e.type === 'reading-translation');
    for (const ex of translation) {
      const targetItem = ex.targetItem as ReadingItem;
      expect(ex.options[ex.correctIndex]).toBe(targetItem.translation);
    }
  });
});
