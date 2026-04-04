import type { Module, KanaItem, VocabItem, GrammarItem, Exercise, Answer } from '@keiro/types';
import { createMultipleChoice, shuffle } from './exercises.js';

export interface PlacementResult {
  passedModuleIds: string[];
  startModuleId: string;
}

/**
 * Generates a staged placement quiz:
 * - Stage 1 (0-9):  5 hiragana + 5 katakana char-to-romaji
 * - Stage 2 (10-14): 5 N5 vocab word-to-meaning  (optional)
 * - Stage 3 (15-17): 3 N5 grammar pick-correct   (optional)
 *
 * Falls back to kana-only (10 questions) when vocab/grammar are omitted.
 */
export function generatePlacementQuiz(
  allModules: Module[],
  allKanaItems: KanaItem[],
  allVocabItems?: VocabItem[],
  allGrammarItems?: GrammarItem[],
): Exercise[] {
  const hiraganaModules = allModules.filter((m) => m.id.startsWith('hiragana-'));
  const katakanaModules = allModules.filter((m) => m.id.startsWith('katakana-'));

  const selectedHiragana = selectKanaAcrossGroups(hiraganaModules, 5);
  const selectedKatakana = selectKanaAcrossGroups(katakanaModules, 5);

  const exercises: Exercise[] = [
    ...selectedHiragana.map((item) =>
      createMultipleChoice('char-to-romaji', item, allKanaItems),
    ),
    ...selectedKatakana.map((item) =>
      createMultipleChoice('char-to-romaji', item, allKanaItems),
    ),
  ];

  // Stage 2: 5 N5 vocab (word-to-meaning)
  if (allVocabItems && allVocabItems.length >= 5) {
    const vocabSample = shuffle(allVocabItems).slice(0, 5);
    for (const item of vocabSample) {
      exercises.push(createVocabWordToMeaning(item, allVocabItems));
    }
  }

  // Stage 3: 3 N5 grammar (grammar-pick-correct)
  if (allGrammarItems && allGrammarItems.length >= 3) {
    const grammarSample = shuffle(allGrammarItems).slice(0, 3);
    for (const item of grammarSample) {
      exercises.push(createGrammarPickCorrect(item, allGrammarItems));
    }
  }

  return exercises;
}

function createVocabWordToMeaning(target: VocabItem, pool: VocabItem[]): Exercise {
  const distractorPool = pool.filter((item) => item.word !== target.word);
  const distractors = shuffle(distractorPool).slice(0, 3).map((d) => d.meaning);
  const allOptions = shuffle([target.meaning, ...distractors]);
  const correctIndex = allOptions.indexOf(target.meaning);
  const questionDetail = target.reading !== target.word ? target.reading : undefined;

  return {
    type: 'word-to-meaning',
    question: target.word,
    ...(questionDetail && { questionDetail }),
    options: allOptions,
    correctIndex,
    targetItem: target,
  };
}

function createGrammarPickCorrect(target: GrammarItem, pool: GrammarItem[]): Exercise {
  const correctExample = target.examples[0];
  const otherItems = pool.filter((g) => g.id !== target.id);
  const distractors = shuffle(otherItems)
    .slice(0, 3)
    .map((g) => g.examples[0]?.japanese)
    .filter((s): s is string => Boolean(s));

  const correctOption = correctExample?.japanese ?? '';
  const allOptions = shuffle([correctOption, ...distractors]);
  const correctIndex = allOptions.indexOf(correctOption);

  return {
    type: 'grammar-pick-correct',
    question: target.title,
    questionDetail: target.structure,
    options: allOptions,
    correctIndex,
    targetItem: target,
  };
}

/**
 * Selects kana items spread across different module groups to avoid clustering.
 * Picks one item per module in round-robin fashion until count is reached.
 */
function selectKanaAcrossGroups(
  modules: Module[],
  count: number,
): KanaItem[] {
  const shuffledModules = shuffle(modules);
  const selected: KanaItem[] = [];
  let moduleIndex = 0;

  const moduleItemPools = shuffledModules.map((m) => shuffle(m.items as KanaItem[]));

  while (selected.length < count) {
    const pool = moduleItemPools[moduleIndex % moduleItemPools.length];
    if (pool.length > 0) {
      selected.push(pool.pop()!);
    }
    moduleIndex++;
    // Safety: break if no items remain in any pool
    if (moduleIndex >= moduleItemPools.length * 100) break;
  }

  return selected;
}

const PASS_THRESHOLD = 0.8;

/**
 * Evaluates placement quiz answers by stage:
 * - answers[0-9]:   kana (5 hiragana + 5 katakana)
 * - answers[10-14]: vocab (optional)
 * - answers[15-17]: grammar (optional)
 *
 * Passing vocab also passes N5 kanji modules (they correlate).
 */
export function evaluatePlacement(
  answers: Answer[],
  allModules: Module[],
): PlacementResult {
  const kanaAnswers = answers.slice(0, 10);
  const hiraganaAnswers = kanaAnswers.slice(0, 5);
  const katakanaAnswers = kanaAnswers.slice(5, 10);
  const vocabAnswers = answers.slice(10, 15);
  const grammarAnswers = answers.slice(15, 18);

  const hiraganaPass = hiraganaAnswers.filter((a) => a.isCorrect).length / 5 >= PASS_THRESHOLD;
  const katakanaPass = katakanaAnswers.filter((a) => a.isCorrect).length / 5 >= PASS_THRESHOLD;
  const vocabPass =
    vocabAnswers.length > 0 &&
    vocabAnswers.filter((a) => a.isCorrect).length >= 4;
  const grammarPass =
    grammarAnswers.length > 0 &&
    grammarAnswers.filter((a) => a.isCorrect).length >= 2;

  const sorted = [...allModules].sort((a, b) => a.order - b.order);
  const passedModuleIds: string[] = [];

  for (const mod of sorted) {
    if (mod.type === 'kana' && mod.id.startsWith('hiragana-') && hiraganaPass) {
      passedModuleIds.push(mod.id);
    } else if (mod.type === 'kana' && mod.id.startsWith('katakana-') && katakanaPass) {
      passedModuleIds.push(mod.id);
    } else if (mod.type === 'vocabulary' && mod.level === 'n5' && vocabPass) {
      passedModuleIds.push(mod.id);
    } else if (mod.type === 'kanji' && mod.level === 'n5' && vocabPass) {
      // Vocab pass implies kanji familiarity at N5
      passedModuleIds.push(mod.id);
    } else if (mod.type === 'grammar' && mod.level === 'n5' && grammarPass) {
      passedModuleIds.push(mod.id);
    }
  }

  // Find first module not in passedModuleIds
  const passedSet = new Set(passedModuleIds);
  let startModuleId = sorted[sorted.length - 1]?.id ?? '';

  for (const mod of sorted) {
    if (!passedSet.has(mod.id)) {
      startModuleId = mod.id;
      break;
    }
  }

  return { passedModuleIds, startModuleId };
}
