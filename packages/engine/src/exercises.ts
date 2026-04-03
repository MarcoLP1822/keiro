import type {
  Module,
  KanaItem,
  VocabItem,
  KanjiItem,
  GrammarItem,
  ReadingItem,
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
 * Creates a sentence gap-fill exercise for a vocab item.
 * Replaces the target word in its example sentence with ___.
 */
function createGapFillExercise(
  target: VocabItem,
  pool: VocabItem[],
): Exercise | null {
  if (!target.example) return null;

  const sentence = target.example.japanese;
  // Replace the word in the sentence with ___
  const sentenceWithGap = sentence.replace(target.word, '___');
  // If replacement didn't change anything (word not found literally), skip
  if (sentenceWithGap === sentence) return null;

  const distractorPool = pool.filter(
    (item) => item.word !== target.word,
  );
  const samePOS = distractorPool.filter((item) => item.partOfSpeech === target.partOfSpeech);
  const source = samePOS.length >= 3 ? samePOS : distractorPool;
  const distractors = shuffle(source).slice(0, 3).map((d) => d.word);

  const allOptions = shuffle([target.word, ...distractors]);
  const correctIndex = allOptions.indexOf(target.word);

  return {
    type: 'sentence-gap-fill',
    question: target.meaning,
    questionDetail: target.example.english,
    sentenceWithGap,
    options: allOptions,
    correctIndex,
    targetItem: target,
  };
}

/**
 * Creates a typing-meaning exercise: show Japanese word, type English meaning.
 */
function createTypingMeaningExercise(target: VocabItem): Exercise {
  return {
    type: 'typing-meaning',
    question: target.word,
    questionDetail: target.reading !== target.word ? target.reading : undefined,
    correctAnswer: target.meaning,
    options: [],
    correctIndex: -1,
    targetItem: target,
  };
}

/**
 * Generates word-to-meaning and meaning-to-word exercises for each item in a vocab module.
 * Also generates gap-fill and typing exercises (~30% new types).
 */
export function generateVocabExercises(
  module: Module,
  allVocabItems: VocabItem[],
): Exercise[] {
  const items = module.items as VocabItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];
  for (const item of items) {
    // Always generate MC exercises (the core ~70%)
    exercises.push(
      createVocabExercise('word-to-meaning', item, allVocabItems),
      createVocabExercise('meaning-to-word', item, allVocabItems),
    );

    // Add new types for ~30% of items (every ~3rd item)
    if (Math.random() < 0.3) {
      const gapFill = createGapFillExercise(item, allVocabItems);
      if (gapFill) exercises.push(gapFill);
    }
    if (Math.random() < 0.3) {
      exercises.push(createTypingMeaningExercise(item));
    }
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
 * Creates a typing-reading exercise: show kanji, type the hiragana reading.
 */
function createTypingReadingExercise(target: KanjiItem): Exercise {
  const readings = [...target.kunReading, ...target.onReading];
  const correctAnswer = readings[0] ?? target.kanji;

  return {
    type: 'typing-reading',
    question: target.kanji,
    correctAnswer,
    options: [],
    correctIndex: -1,
    targetItem: target,
  };
}

/**
 * Generates kanji-to-meaning and kanji-to-reading exercises for each item in a kanji module.
 * Also generates typing-reading exercises (~30% of items).
 */
export function generateKanjiExercises(
  module: Module,
  allKanjiItems: KanjiItem[],
): Exercise[] {
  const items = module.items as KanjiItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];
  for (const item of items) {
    // Always generate MC exercises
    exercises.push(
      createKanjiExercise('kanji-to-meaning', item, allKanjiItems),
      createKanjiExercise('kanji-to-reading', item, allKanjiItems),
    );

    // Add typing-reading for ~30% of items
    if (Math.random() < 0.3) {
      exercises.push(createTypingReadingExercise(item));
    }
  }
  return shuffle(exercises);
}

// --- Grammar exercise generators ---

/**
 * Creates a sentence-order exercise: split example sentence into words, shuffle them.
 */
function createSentenceOrderExercise(
  item: GrammarItem,
  exampleIndex: number,
): Exercise | null {
  const example = item.examples[exampleIndex];
  if (!example) return null;

  // Split Japanese sentence into segments by particles and words.
  // Use a simple character-aware split: split on natural boundaries.
  // For Japanese, we split on particles and punctuation as separate tokens.
  const sentence = example.japanese;
  // Split by common particle boundaries. Use regex to split into meaningful chunks.
  // A pragmatic approach: split by spaces if present, otherwise split by character groups.
  const words = sentence.match(/[\u3040-\u309F]+|[\u30A0-\u30FF]+|[\u4E00-\u9FFF]+|[\uFF00-\uFFEF]+|[。、！？]/g);
  if (!words || words.length < 3) return null;

  // Filter out punctuation for scrambling, keep it for correct order
  const correctOrder = words.filter((w) => !w.match(/^[。、！？]$/));
  if (correctOrder.length < 3) return null;

  const scrambledWords = shuffle(correctOrder);

  return {
    type: 'grammar-sentence-order',
    question: item.title,
    questionDetail: example.english,
    scrambledWords,
    correctOrder,
    options: [],
    correctIndex: -1,
    targetItem: item,
  };
}

/**
 * Generates grammar-pick-correct exercises for each item in a grammar module.
 * Also generates sentence-order exercises (~30% of items).
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

    // Add sentence-order exercise for ~30% of items
    if (Math.random() < 0.3 && item.examples.length > 0) {
      const orderExercise = createSentenceOrderExercise(item, 0);
      if (orderExercise) exercises.push(orderExercise);
    }
  }

  return shuffle(exercises);
}

// --- Reading exercise generators ---

/**
 * Generates reading-comprehension and reading-translation exercises for a reading module.
 * Each ReadingItem produces one exercise per question (comprehension) plus one translation exercise.
 */
export function generateReadingExercises(module: Module): Exercise[] {
  const items = module.items as ReadingItem[];
  if (items.length === 0) return [];

  const exercises: Exercise[] = [];

  for (const item of items) {
    // Generate a reading-comprehension exercise for each question
    for (const q of item.questions) {
      exercises.push({
        type: 'reading-comprehension',
        question: item.passage,
        questionDetail: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        targetItem: item,
      });
    }

    // Generate a reading-translation exercise: show the passage, pick the correct full translation
    // Build 3 distractor translations from other passages in the module
    const otherItems = items.filter((other) => other.passage !== item.passage);
    const distractorTranslations = shuffle(otherItems)
      .slice(0, 3)
      .map((other) => other.translation);

    // Only generate if we have at least 1 distractor
    if (distractorTranslations.length > 0) {
      const allOptions = shuffle([item.translation, ...distractorTranslations]);
      const correctIndex = allOptions.indexOf(item.translation);

      exercises.push({
        type: 'reading-translation',
        question: item.passage,
        questionDetail: 'Choose the correct translation',
        options: allOptions,
        correctIndex,
        targetItem: item,
      });
    }
  }

  return shuffle(exercises);
}
