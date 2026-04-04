import { describe, it, expect } from 'vitest';
import { generatePlacementQuiz, evaluatePlacement } from '../src/placement.js';
import type { Module, KanaItem, VocabItem, GrammarItem, Answer, Exercise } from '@keiro/types';

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

function makeVocabModule(
  id: string,
  order: number,
  items: VocabItem[],
): Module {
  return {
    id,
    name: `Module ${id}`,
    type: 'vocabulary',
    level: 'n5',
    order,
    intro: { title: '', explanation: '', cultureNote: null },
    items,
  };
}

function makeKanjiModule(
  id: string,
  order: number,
): Module {
  return {
    id,
    name: `Module ${id}`,
    type: 'kanji',
    level: 'n5',
    order,
    intro: { title: '', explanation: '', cultureNote: null },
    items: [],
  };
}

function makeGrammarModule(
  id: string,
  order: number,
  items: GrammarItem[],
): Module {
  return {
    id,
    name: `Module ${id}`,
    type: 'grammar',
    level: 'n5',
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

function makeVocabItem(word: string, meaning: string): VocabItem {
  return { word, reading: word, meaning, partOfSpeech: 'noun' };
}

function makeGrammarItem(id: string, title: string): GrammarItem {
  return {
    id,
    title,
    explanation: 'test',
    structure: 'Noun + ' + title,
    examples: [
      { japanese: `これは${title}です。`, english: `This is ${title}.` },
      { japanese: `それは${title}です。`, english: `That is ${title}.` },
    ],
    notes: null,
  };
}

const allVocabItems: VocabItem[] = [
  makeVocabItem('水', 'water'),
  makeVocabItem('火', 'fire'),
  makeVocabItem('山', 'mountain'),
  makeVocabItem('川', 'river'),
  makeVocabItem('空', 'sky'),
  makeVocabItem('海', 'sea'),
  makeVocabItem('花', 'flower'),
  makeVocabItem('木', 'tree'),
];

const allGrammarItems: GrammarItem[] = [
  makeGrammarItem('g1', 'です'),
  makeGrammarItem('g2', 'ます'),
  makeGrammarItem('g3', 'は'),
  makeGrammarItem('g4', 'が'),
  makeGrammarItem('g5', 'を'),
];

const vocabModule = makeVocabModule('vocab-n5-1', 21, allVocabItems);
const kanjiModule = makeKanjiModule('kanji-n5-1', 31);
const grammarModule = makeGrammarModule('grammar-n5-1', 41, allGrammarItems);

const kanaModules = [...hiraganaModules, ...katakanaModules];
const allModules = [...kanaModules, vocabModule, kanjiModule, grammarModule];
const allKanaItems: KanaItem[] = kanaModules.flatMap((m) => m.items as KanaItem[]);

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
  vocabCorrect?: number,
  grammarCorrect?: number,
): Answer[] {
  const answers: Answer[] = [];
  for (let i = 0; i < 5; i++) {
    answers.push(makeAnswer(i < hiraganaCorrect, i));
  }
  for (let i = 0; i < 5; i++) {
    answers.push(makeAnswer(i < katakanaCorrect, i + 5));
  }
  if (vocabCorrect !== undefined) {
    for (let i = 0; i < 5; i++) {
      answers.push(makeAnswer(i < vocabCorrect, i + 10));
    }
  }
  if (grammarCorrect !== undefined) {
    for (let i = 0; i < 3; i++) {
      answers.push(makeAnswer(i < grammarCorrect, i + 15));
    }
  }
  return answers;
}

describe('generatePlacementQuiz', () => {
  it('returns exactly 10 exercises (kana-only) when no vocab/grammar provided', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems);
    expect(exercises).toHaveLength(10);
    expect(exercises.every((e) => e.type === 'char-to-romaji')).toBe(true);
  });

  it('returns 18 exercises when vocab and grammar are provided', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems, allVocabItems, allGrammarItems);
    expect(exercises).toHaveLength(18);
  });

  it('first 10 exercises are char-to-romaji kana', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems, allVocabItems, allGrammarItems);
    expect(exercises.slice(0, 10).every((e) => e.type === 'char-to-romaji')).toBe(true);
  });

  it('exercises 10-14 are word-to-meaning vocab', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems, allVocabItems, allGrammarItems);
    expect(exercises.slice(10, 15).every((e) => e.type === 'word-to-meaning')).toBe(true);
  });

  it('exercises 15-17 are grammar-pick-correct', () => {
    const exercises = generatePlacementQuiz(allModules, allKanaItems, allVocabItems, allGrammarItems);
    expect(exercises.slice(15, 18).every((e) => e.type === 'grammar-pick-correct')).toBe(true);
  });

  it('falls back to 10 questions when insufficient vocab items', () => {
    const fewVocab = allVocabItems.slice(0, 3);
    const exercises = generatePlacementQuiz(allModules, allKanaItems, fewVocab, allGrammarItems);
    // vocab stage skipped (< 5 items), grammar stage should still appear → 13 questions
    expect(exercises).toHaveLength(13);
  });
});

describe('evaluatePlacement (kana-only answers)', () => {
  it('passing all kana marks all kana modules as passed', () => {
    const answers = makePlacementAnswers(5, 5);
    const result = evaluatePlacement(answers, kanaModules);
    expect(result.passedModuleIds).toEqual(
      expect.arrayContaining(kanaModules.map((m) => m.id)),
    );
    expect(result.passedModuleIds).toHaveLength(kanaModules.length);
    expect(result.startModuleId).toBe('katakana-k');
  });

  it('passing hiragana only marks only hiragana modules as passed', () => {
    const answers = makePlacementAnswers(5, 0);
    const result = evaluatePlacement(answers, kanaModules);
    expect(result.passedModuleIds).toEqual(hiraganaModules.map((m) => m.id));
    expect(result.startModuleId).toBe('katakana-vowels');
  });

  it('failing all starts at first module with no passed modules', () => {
    const answers = makePlacementAnswers(0, 0);
    const result = evaluatePlacement(answers, kanaModules);
    expect(result.passedModuleIds).toEqual([]);
    expect(result.startModuleId).toBe('hiragana-vowels');
  });

  it('passing katakana but not hiragana starts at first hiragana module', () => {
    const answers = makePlacementAnswers(0, 5);
    const result = evaluatePlacement(answers, kanaModules);
    expect(result.passedModuleIds).toEqual(katakanaModules.map((m) => m.id));
    expect(result.startModuleId).toBe('hiragana-vowels');
  });

  it('80% threshold: 4/5 correct passes, 3/5 fails', () => {
    const answers = makePlacementAnswers(4, 3);
    const result = evaluatePlacement(answers, kanaModules);
    expect(result.passedModuleIds).toEqual(hiraganaModules.map((m) => m.id));
    expect(result.startModuleId).toBe('katakana-vowels');
  });
});

describe('evaluatePlacement (extended quiz with vocab + grammar)', () => {
  it('passing vocab passes N5 vocab and kanji modules', () => {
    // 5/5 kana each, 5/5 vocab, 0/3 grammar
    const answers = makePlacementAnswers(5, 5, 5, 0);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toContain(vocabModule.id);
    expect(result.passedModuleIds).toContain(kanjiModule.id);
    expect(result.passedModuleIds).not.toContain(grammarModule.id);
  });

  it('passing grammar passes N5 grammar modules', () => {
    const answers = makePlacementAnswers(5, 5, 5, 3);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toContain(grammarModule.id);
  });

  it('vocab pass also passes kanji even when grammar fails', () => {
    const answers = makePlacementAnswers(5, 5, 4, 0);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).toContain(kanjiModule.id);
    expect(result.passedModuleIds).not.toContain(grammarModule.id);
  });

  it('3/5 vocab (below threshold) does not pass vocab or kanji', () => {
    const answers = makePlacementAnswers(5, 5, 3, 3);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).not.toContain(vocabModule.id);
    expect(result.passedModuleIds).not.toContain(kanjiModule.id);
  });

  it('1/3 grammar (below threshold) does not pass grammar modules', () => {
    const answers = makePlacementAnswers(5, 5, 5, 1);
    const result = evaluatePlacement(answers, allModules);
    expect(result.passedModuleIds).not.toContain(grammarModule.id);
  });

  it('backward compat: kana-only answers still evaluate correctly', () => {
    const answers = makePlacementAnswers(5, 5);
    const result = evaluatePlacement(answers, allModules);
    // No vocab/grammar answers supplied so those sections won't pass
    expect(result.passedModuleIds).not.toContain(vocabModule.id);
    expect(result.passedModuleIds).not.toContain(grammarModule.id);
    expect(result.passedModuleIds).not.toContain(kanjiModule.id);
    // All kana should be passed
    expect(result.passedModuleIds).toEqual(expect.arrayContaining(kanaModules.map((m) => m.id)));
  });

  it('passing everything starts user after the last N5 module', () => {
    const answers = makePlacementAnswers(5, 5, 5, 3);
    const result = evaluatePlacement(answers, allModules);
    // All modules in our test set should be passed
    const allIds = allModules.map((m) => m.id);
    expect(result.passedModuleIds).toEqual(expect.arrayContaining(allIds));
  });
});
