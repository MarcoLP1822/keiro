import type { Module, KanaItem, Exercise, ExerciseType } from '@keiro/types';

/**
 * Fisher-Yates shuffle. Returns a new shuffled array (does not mutate input).
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Creates a multiple-choice exercise with 1 correct answer and up to 3 distractors.
 * If the pool has fewer than 4 items, uses whatever is available (no duplicates).
 */
export function createMultipleChoice(
  type: ExerciseType,
  target: KanaItem,
  pool: KanaItem[],
): Exercise {
  // Build distractor pool excluding the target
  const distractorPool = pool.filter(
    (item) => item.character !== target.character || item.romaji !== target.romaji,
  );

  const distractorCount = Math.min(3, distractorPool.length);
  const distractors = shuffle(distractorPool).slice(0, distractorCount);

  // Determine question and option values based on exercise type
  let question: string;
  let correctOption: string;
  let distractorOptions: string[];

  switch (type) {
    case 'char-to-romaji':
      question = target.character;
      correctOption = target.romaji;
      distractorOptions = distractors.map((d) => d.romaji);
      break;
    case 'romaji-to-char':
      question = target.romaji;
      correctOption = target.character;
      distractorOptions = distractors.map((d) => d.character);
      break;
    case 'audio-to-char':
      question = target.character; // The character to be spoken via audio
      correctOption = target.character;
      distractorOptions = distractors.map((d) => d.character);
      break;
  }

  // Combine and shuffle options, then find where the correct answer ended up
  const allOptions = shuffle([correctOption, ...distractorOptions]);
  const correctIndex = allOptions.indexOf(correctOption);

  return {
    type,
    question,
    options: allOptions,
    correctIndex,
    targetItem: target,
  };
}

/**
 * Generates char-to-romaji and romaji-to-char exercises for each item in a kana module.
 * Returns a shuffled array of exercises.
 */
export function generateKanaExercises(
  module: Module,
  allKanaItems: KanaItem[],
): Exercise[] {
  const items = module.items as KanaItem[];

  if (items.length === 0) {
    return [];
  }

  const exercises: Exercise[] = [];

  for (const item of items) {
    exercises.push(
      createMultipleChoice('char-to-romaji', item, allKanaItems),
      createMultipleChoice('romaji-to-char', item, allKanaItems),
    );
  }

  return shuffle(exercises);
}

/**
 * Generates audio-to-char exercises for a kana module.
 * Each exercise: hear a character's pronunciation, pick the correct character.
 */
export function generateAudioExercises(
  module: Module,
  allKanaItems: KanaItem[],
): Exercise[] {
  const items = module.items as KanaItem[];

  if (items.length === 0) {
    return [];
  }

  const exercises: Exercise[] = [];

  for (const item of items) {
    exercises.push(createMultipleChoice('audio-to-char', item, allKanaItems));
  }

  return shuffle(exercises);
}
