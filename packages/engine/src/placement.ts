import type { Module, KanaItem, Exercise, Answer } from '@keiro/types';
import { createMultipleChoice, shuffle } from './exercises.js';

export interface PlacementResult {
  passedModuleIds: string[];
  startModuleId: string;
}

/**
 * Generates a 10-question placement quiz: 5 hiragana + 5 katakana char-to-romaji.
 * Selects items randomly across different modules to ensure variety.
 */
export function generatePlacementQuiz(
  allModules: Module[],
  allKanaItems: KanaItem[],
): Exercise[] {
  const hiraganaModules = allModules.filter((m) => m.id.startsWith('hiragana-'));
  const katakanaModules = allModules.filter((m) => m.id.startsWith('katakana-'));

  const selectedHiragana = selectAcrossGroups(hiraganaModules, 5);
  const selectedKatakana = selectAcrossGroups(katakanaModules, 5);

  const exercises: Exercise[] = [
    ...selectedHiragana.map((item) =>
      createMultipleChoice('char-to-romaji', item, allKanaItems),
    ),
    ...selectedKatakana.map((item) =>
      createMultipleChoice('char-to-romaji', item, allKanaItems),
    ),
  ];

  return exercises;
}

/**
 * Selects items spread across different module groups to avoid clustering.
 * Picks one item per module in round-robin fashion until count is reached.
 */
function selectAcrossGroups(
  modules: Module[],
  count: number,
): KanaItem[] {
  const shuffledModules = shuffle(modules);
  const selected: KanaItem[] = [];
  let moduleIndex = 0;

  // Track which items have been picked from each module
  const moduleItemPools = shuffledModules.map((m) => shuffle(m.items as KanaItem[]));

  while (selected.length < count) {
    const pool = moduleItemPools[moduleIndex % moduleItemPools.length];
    if (pool.length > 0) {
      selected.push(pool.pop()!);
    }
    moduleIndex++;
    // Safety: if we've cycled through all modules and still need more,
    // break if no items remain anywhere
    if (moduleIndex >= moduleItemPools.length * 100) break;
  }

  return selected;
}

const PASS_THRESHOLD = 0.8;

/**
 * Evaluates placement quiz answers (first 5 = hiragana, last 5 = katakana).
 * Each section scored independently at 80% threshold.
 */
export function evaluatePlacement(
  answers: Answer[],
  allModules: Module[],
): PlacementResult {
  const hiraganaAnswers = answers.slice(0, 5);
  const katakanaAnswers = answers.slice(5, 10);

  const hiraganaCorrect = hiraganaAnswers.filter((a) => a.isCorrect).length;
  const katakanaCorrect = katakanaAnswers.filter((a) => a.isCorrect).length;

  const hiraganaPass = hiraganaCorrect / 5 >= PASS_THRESHOLD;
  const katakanaPass = katakanaCorrect / 5 >= PASS_THRESHOLD;

  const sorted = [...allModules].sort((a, b) => a.order - b.order);

  const passedModuleIds: string[] = [];

  if (hiraganaPass) {
    for (const mod of sorted) {
      if (mod.type === 'kana' && mod.id.startsWith('hiragana-')) {
        passedModuleIds.push(mod.id);
      }
    }
  }

  if (katakanaPass) {
    for (const mod of sorted) {
      if (mod.type === 'kana' && mod.id.startsWith('katakana-')) {
        passedModuleIds.push(mod.id);
      }
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
