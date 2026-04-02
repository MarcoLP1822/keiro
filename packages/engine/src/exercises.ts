import type {
  Module,
  KanaItem,
  VocabItem,
  KanjiItem,
  GrammarItem,
  Exercise,
  KanaExerciseType,
  VocabExerciseType,
  KanjiExerciseType,
} from '@keiro/types';

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
  type: KanaExerciseType,
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

// --- Vocab exercise generators ---

function createVocabExercise(
  type: VocabExerciseType,
  target: VocabItem,
  pool: VocabItem[],
): Exercise {
  const distractorPool = pool.filter(
    (item) => item.word !== target.word || item.meaning !== target.meaning,
  );

  // Prefer same part of speech for distractors, fall back to full pool
  const samePOS = distractorPool.filter((item) => item.partOfSpeech === target.partOfSpeech);
  const source = samePOS.length >= 3 ? samePOS : distractorPool;

  const distractorCount = Math.min(3, source.length);
  const distractors = shuffle(source).slice(0, distractorCount);

  let question: string;
  let questionDetail: string | undefined;
  let correctOption: string;
  let distractorOptions: string[];

  switch (type) {
    case 'word-to-meaning':
      question = target.word;
      questionDetail = target.reading !== target.word ? target.reading : undefined;
      correctOption = target.meaning;
      distractorOptions = distractors.map((d) => d.meaning);
      break;
    case 'meaning-to-word':
      question = target.meaning;
      correctOption = target.word;
      distractorOptions = distractors.map((d) => d.word);
      break;
    default:
      question = target.word;
      correctOption = target.meaning;
      distractorOptions = distractors.map((d) => d.meaning);
  }

  const allOptions = shuffle([correctOption, ...distractorOptions]);
  const correctIndex = allOptions.indexOf(correctOption);

  return {
    type,
    question,
    ...(questionDetail && { questionDetail }),
    options: allOptions,
    correctIndex,
    targetItem: target,
  };
}

/**
 * Generates word-to-meaning and meaning-to-word exercises for each item in a vocab module.
 */
export function generateVocabExercises(
  module: Module,
  allVocabItems: VocabItem[],
): Exercise[] {
  const items = module.items as VocabItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];
  for (const item of items) {
    exercises.push(
      createVocabExercise('word-to-meaning', item, allVocabItems),
      createVocabExercise('meaning-to-word', item, allVocabItems),
    );
  }
  return shuffle(exercises);
}

// --- Kanji exercise generators ---

function createKanjiExercise(
  type: KanjiExerciseType,
  target: KanjiItem,
  pool: KanjiItem[],
): Exercise {
  const distractorPool = pool.filter((item) => item.kanji !== target.kanji);
  const distractorCount = Math.min(3, distractorPool.length);
  const distractors = shuffle(distractorPool).slice(0, distractorCount);

  let question: string;
  let correctOption: string;
  let distractorOptions: string[];

  switch (type) {
    case 'kanji-to-meaning':
      question = target.kanji;
      correctOption = target.meanings[0];
      distractorOptions = distractors.map((d) => d.meanings[0]);
      break;
    case 'kanji-to-reading': {
      question = target.kanji;
      const targetReadings = [...target.kunReading, ...target.onReading];
      correctOption = targetReadings[0] ?? target.kanji;
      distractorOptions = distractors.map((d) => {
        const readings = [...d.kunReading, ...d.onReading];
        return readings[0] ?? d.kanji;
      });
      break;
    }
    default:
      question = target.kanji;
      correctOption = target.meanings[0];
      distractorOptions = distractors.map((d) => d.meanings[0]);
  }

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
 * Generates kanji-to-meaning and kanji-to-reading exercises for each item in a kanji module.
 */
export function generateKanjiExercises(
  module: Module,
  allKanjiItems: KanjiItem[],
): Exercise[] {
  const items = module.items as KanjiItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];
  for (const item of items) {
    exercises.push(
      createKanjiExercise('kanji-to-meaning', item, allKanjiItems),
      createKanjiExercise('kanji-to-reading', item, allKanjiItems),
    );
  }
  return shuffle(exercises);
}

// --- Grammar exercise generators ---

/**
 * Generates grammar-pick-correct exercises for each item in a grammar module.
 * Shows a grammar point description, pick the correct example sentence.
 */
export function generateGrammarExercises(
  module: Module,
  allGrammarItems: GrammarItem[],
): Exercise[] {
  const items = module.items as GrammarItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];

  for (const item of items) {
    if (!item.examples || item.examples.length === 0) continue;

    for (let i = 0; i < 2; i++) {
      const exampleIndex = i % item.examples.length;
      const correctExample = item.examples[exampleIndex];

      const otherItems = allGrammarItems.filter((g) => g.id !== item.id);
      const distractorSentences = shuffle(otherItems)
        .slice(0, 3)
        .map((g) => g.examples[0]?.japanese)
        .filter(Boolean) as string[];

      const correctOption = correctExample.japanese;
      const allOptions = shuffle([correctOption, ...distractorSentences]);
      const correctIndex = allOptions.indexOf(correctOption);

      exercises.push({
        type: 'grammar-pick-correct',
        question: item.title,
        questionDetail: item.structure,
        options: allOptions,
        correctIndex,
        targetItem: item,
      });
    }
  }

  return shuffle(exercises);
}
