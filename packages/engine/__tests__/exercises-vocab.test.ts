import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateVocabExercises } from '../src/exercises.js';
import type { Module, VocabItem } from '@keiro/types';

const vocabPool: VocabItem[] = [
  {
    word: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    partOfSpeech: 'verb',
    example: { japanese: '私は寿司を食べる。', english: 'I eat sushi.' },
  },
  {
    word: '飲む',
    reading: 'のむ',
    meaning: 'to drink',
    partOfSpeech: 'verb',
    example: { japanese: '水を飲む。', english: 'I drink water.' },
  },
  {
    word: '見る',
    reading: 'みる',
    meaning: 'to see',
    partOfSpeech: 'verb',
    example: { japanese: 'テレビを見る。', english: 'I watch TV.' },
  },
  {
    word: '行く',
    reading: 'いく',
    meaning: 'to go',
    partOfSpeech: 'verb',
  },
  {
    word: '大きい',
    reading: 'おおきい',
    meaning: 'big',
    partOfSpeech: 'adjective',
  },
  {
    word: '小さい',
    reading: 'ちいさい',
    meaning: 'small',
    partOfSpeech: 'adjective',
  },
  {
    word: '学校',
    reading: 'がっこう',
    meaning: 'school',
    partOfSpeech: 'noun',
  },
  {
    word: '先生',
    reading: 'せんせい',
    meaning: 'teacher',
    partOfSpeech: 'noun',
  },
];

function makeModule(items: VocabItem[]): Module {
  return {
    id: 'test-vocab-mod',
    name: 'Test Vocab',
    type: 'vocabulary',
    level: 'n5',
    order: 2000,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

describe('generateVocabExercises', () => {
  // Control Math.random for deterministic tests on random-gated branches
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Default: always return 0.5 so the 0.3 random gates never fire
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('produces word-to-meaning exercises', () => {
    const mod = makeModule(vocabPool.slice(0, 3));
    const exercises = generateVocabExercises(mod, vocabPool);
    const wordToMeaning = exercises.filter((e) => e.type === 'word-to-meaning');
    expect(wordToMeaning.length).toBeGreaterThanOrEqual(3);
  });

  it('produces meaning-to-word exercises', () => {
    const mod = makeModule(vocabPool.slice(0, 3));
    const exercises = generateVocabExercises(mod, vocabPool);
    const meaningToWord = exercises.filter((e) => e.type === 'meaning-to-word');
    expect(meaningToWord.length).toBeGreaterThanOrEqual(3);
  });

  it('each exercise has 4 unique options', () => {
    const mod = makeModule(vocabPool.slice(0, 3));
    const exercises = generateVocabExercises(mod, vocabPool);
    const mcExercises = exercises.filter(
      (e) => e.type === 'word-to-meaning' || e.type === 'meaning-to-word',
    );
    for (const ex of mcExercises) {
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4);
    }
  });

  it('correct answer is always in options', () => {
    const mod = makeModule(vocabPool.slice(0, 3));
    const exercises = generateVocabExercises(mod, vocabPool);
    const mcExercises = exercises.filter(
      (e) => e.type === 'word-to-meaning' || e.type === 'meaning-to-word',
    );
    for (const ex of mcExercises) {
      expect(ex.correctIndex).toBeGreaterThanOrEqual(0);
      expect(ex.correctIndex).toBeLessThan(ex.options.length);
    }
  });

  it('distractors are from the pool, not the target', () => {
    const target = vocabPool[0];
    const mod = makeModule([target]);
    const exercises = generateVocabExercises(mod, vocabPool);
    const wordToMeaning = exercises.find((e) => e.type === 'word-to-meaning')!;
    // The correct option
    const correctOpt = wordToMeaning.options[wordToMeaning.correctIndex];
    expect(correctOpt).toBe(target.meaning);
    // Distractors should not equal the target meaning
    const distractors = wordToMeaning.options.filter((_, i) => i !== wordToMeaning.correctIndex);
    for (const d of distractors) {
      expect(d).not.toBe(target.meaning);
    }
  });

  it('gap-fill exercises are generated when items have examples', () => {
    // Force Math.random to always return < 0.3 so gap-fill triggers
    randomSpy.mockReturnValue(0.1);
    const itemsWithExamples = vocabPool.filter((v) => v.example);
    const mod = makeModule(itemsWithExamples);
    const exercises = generateVocabExercises(mod, vocabPool);
    const gapFills = exercises.filter((e) => e.type === 'sentence-gap-fill');
    expect(gapFills.length).toBeGreaterThan(0);
    for (const gf of gapFills) {
      expect(gf.sentenceWithGap).toBeDefined();
      expect(gf.sentenceWithGap).toContain('___');
    }
  });

  it('typing-meaning exercises are generated', () => {
    // Force Math.random to always return < 0.3 so typing triggers
    randomSpy.mockReturnValue(0.1);
    const mod = makeModule(vocabPool.slice(0, 3));
    const exercises = generateVocabExercises(mod, vocabPool);
    const typingExercises = exercises.filter((e) => e.type === 'typing-meaning');
    expect(typingExercises.length).toBeGreaterThan(0);
    for (const te of typingExercises) {
      expect(te.correctAnswer).toBeDefined();
      expect(te.correctIndex).toBe(-1);
    }
  });

  it('empty module returns empty array', () => {
    const mod = makeModule([]);
    const exercises = generateVocabExercises(mod, vocabPool);
    expect(exercises).toEqual([]);
  });

  it('small pool (< 4 items) does not crash', () => {
    const smallPool = vocabPool.slice(0, 2);
    const mod = makeModule(smallPool);
    const exercises = generateVocabExercises(mod, smallPool);
    expect(exercises.length).toBeGreaterThan(0);
    // Options should have 2 items (target + 1 distractor)
    const mc = exercises.find((e) => e.type === 'word-to-meaning')!;
    expect(mc.options.length).toBe(2);
    expect(mc.options[mc.correctIndex]).toBeDefined();
  });
});
