import type {
  Module,
  VocabItem,
  GrammarItem,
  SentenceItem,
} from '@keiro/types';
import type { SessionPlan, SessionStep, Exercise } from '@keiro/types';
import type { SrsCard } from '@keiro/types';
import type { PlanSize } from './daily-plan.js';
import {
  generateImageExercise,
  generateSentenceReadingExercise,
  shuffle,
} from './exercises.js';
import { selectSentences } from './i-plus-one.js';

export interface SessionConfig {
  module: Module;
  knownVocab: Set<string>;
  knownGrammar: Set<string>;
  dueCards: SrsCard[];
  size: PlanSize;
}

/** How many vocab items to present per learn step, keyed by plan size */
const VOCAB_COUNTS: Record<PlanSize, number> = {
  small: 3,
  medium: 4,
  large: 5,
};

/** How many grammar items to present in the grammar learn step */
const GRAMMAR_COUNTS: Record<PlanSize, number> = {
  small: 1,
  medium: 1,
  large: 2,
};

/** How many SRS review cards to surface */
const REVIEW_COUNTS: Record<PlanSize, number> = {
  small: 2,
  medium: 2,
  large: 3,
};

/**
 * Generates a multiple-choice vocab exercise for a single VocabItem.
 * Prefers an image exercise when the item has an imageUrl; falls back to a
 * word-to-meaning exercise so every item always produces exactly one exercise.
 */
function generateVocabExercise(
  item: VocabItem,
  pool: VocabItem[],
): Exercise {
  const imageExercise = generateImageExercise(item, pool);
  if (imageExercise) return imageExercise;

  // Fallback: word-to-meaning multiple choice
  const distractorPool = pool.filter((v) => v.word !== item.word);
  const distractorCount = Math.min(3, distractorPool.length);
  const distractors = shuffle(distractorPool).slice(0, distractorCount);

  const correctOption = item.meaning;
  const distractorOptions = distractors.map((d) => d.meaning);

  const shuffledDistractors = shuffle(distractorOptions);
  const allOptions = [...shuffledDistractors];
  const insertAt = Math.floor(Math.random() * (allOptions.length + 1));
  allOptions.splice(insertAt, 0, correctOption);

  return {
    type: 'word-to-meaning',
    question: item.word,
    questionDetail: item.reading !== item.word ? item.reading : undefined,
    options: allOptions,
    correctIndex: insertAt,
    targetItem: item,
  };
}

/**
 * Generates a grammar-pick-correct exercise for a single GrammarItem.
 * Uses the first example sentence as the correct answer; other grammar items
 * in the pool provide distractors.
 */
function generateGrammarExercise(
  item: GrammarItem,
  pool: GrammarItem[],
): Exercise | null {
  if (!item.examples || item.examples.length === 0) return null;

  const correctOption = item.examples[0].japanese;
  const otherItems = pool.filter((g) => g.id !== item.id);
  const distractors = shuffle(otherItems)
    .slice(0, 3)
    .map((g) => g.examples[0]?.japanese)
    .filter(Boolean) as string[];

  if (distractors.length === 0) return null;

  const shuffledDistractors = shuffle(distractors);
  const allOptions = [...shuffledDistractors];
  const insertAt = Math.floor(Math.random() * (allOptions.length + 1));
  allOptions.splice(insertAt, 0, correctOption);

  return {
    type: 'grammar-pick-correct',
    question: item.title,
    questionDetail: item.structure,
    options: allOptions,
    correctIndex: insertAt,
    targetItem: item,
  };
}

/**
 * Generates a comprehension question for a sentence.
 * Creates a sentence-reading exercise but frames it as a comprehension check by
 * explicitly asking about the sentence's meaning.
 */
function generateComprehensionExercise(
  sentence: SentenceItem,
  allSentences: SentenceItem[],
): Exercise {
  return generateSentenceReadingExercise(sentence, allSentences);
}

/**
 * Creates a review exercise from an SRS card by constructing a minimal vocab
 * exercise using the card's stored item metadata. This is a lightweight
 * representation — the full exercise will be replaced by useReviewSession when
 * the actual content item is loaded from the DB.
 *
 * Only vocab-type cards produce exercises here; other content types are skipped.
 * Returns null for non-vocab cards or when the item cannot be matched.
 */
function generateReviewExerciseFromCard(
  card: SrsCard,
  vocabPool: VocabItem[],
): Exercise | null {
  if (card.contentType !== 'vocabulary') return null;

  const item = vocabPool.find((v) => v.word === card.itemId);
  if (!item) return null;

  return generateVocabExercise(item, vocabPool);
}

/**
 * Finds the best i+0 sentence (all vocab known) for the cooldown "you can read this"
 * moment. Falls back to the sentence with the fewest unknowns if no fully-known
 * sentence exists.
 */
function selectCooldownSentence(
  knownVocab: Set<string>,
  sentences: SentenceItem[],
): SentenceItem | null {
  if (sentences.length === 0) return null;

  // Prefer i+0 (all vocab known)
  const fullyKnown = sentences.filter(
    (s) => s.requiredVocab.every((v) => knownVocab.has(v)),
  );
  if (fullyKnown.length > 0) {
    // Among fully-known sentences, prefer shorter ones for readability
    return [...fullyKnown].sort((a, b) => a.japanese.length - b.japanese.length)[0];
  }

  // Fallback: fewest unknowns
  return [...sentences].sort((a, b) => {
    const aUnknown = a.requiredVocab.filter((v) => !knownVocab.has(v)).length;
    const bUnknown = b.requiredVocab.filter((v) => !knownVocab.has(v)).length;
    return aUnknown - bUnknown;
  })[0];
}

/**
 * Plans a dynamic study session for a thematic module.
 *
 * The session follows a fixed pedagogical loop:
 *   Review (if due cards exist) → Learn vocab → Read i+1 → Comprehend →
 *   Learn grammar → Read i+1 → Cooldown "You can read this!"
 *
 * Each step only appears when there is content to fill it. The `size` parameter
 * scales the number of items in each learn step.
 */
export function planDynamicSession(config: SessionConfig): SessionPlan {
  const { module, knownVocab, dueCards, size } = config;

  const vocab: VocabItem[] = module.vocab ?? [];
  const grammar: GrammarItem[] = module.grammar ?? [];
  const sentences: SentenceItem[] = module.sentences ?? [];

  const steps: SessionStep[] = [];

  // --- Step 1: Review (SRS due cards) ---
  if (dueCards.length > 0) {
    const reviewCount = REVIEW_COUNTS[size];
    const reviewCards = dueCards.slice(0, reviewCount);
    const reviewExercises: Exercise[] = [];

    for (const card of reviewCards) {
      const ex = generateReviewExerciseFromCard(card, vocab);
      if (ex) reviewExercises.push(ex);
    }

    if (reviewExercises.length > 0) {
      steps.push({
        type: 'review',
        exercises: reviewExercises,
        label: 'Review',
      });
    }
  }

  // --- Step 2: Learn vocab ---
  const unknownVocab = vocab.filter((v) => !knownVocab.has(v.word));
  const learnVocabCount = VOCAB_COUNTS[size];
  const learnVocabItems = unknownVocab.slice(0, learnVocabCount);

  if (learnVocabItems.length > 0) {
    const learnExercises = learnVocabItems.map((item) =>
      generateVocabExercise(item, vocab),
    );
    steps.push({
      type: 'learn',
      exercises: learnExercises,
      label: 'Learn',
    });
  }

  // Build the augmented known vocab set (known + just-learned) for sentence selection
  const expandedKnownVocab = new Set([
    ...knownVocab,
    ...learnVocabItems.map((v) => v.word),
  ]);

  // --- Step 3: Read (i+1 sentence using just-learned vocab) ---
  const firstReadSentences = selectSentences(expandedKnownVocab, sentences, 1);
  if (firstReadSentences.length > 0) {
    const sentence = firstReadSentences[0];
    steps.push({
      type: 'read',
      exercises: [generateSentenceReadingExercise(sentence, sentences)],
      label: 'Read',
    });

    // --- Step 4: Comprehend (question about the sentence just shown) ---
    steps.push({
      type: 'comprehend',
      exercises: [generateComprehensionExercise(sentence, sentences)],
      label: 'Comprehend',
    });
  }

  // --- Step 5: Learn grammar ---
  const grammarCount = GRAMMAR_COUNTS[size];
  const grammarItems = grammar.slice(0, grammarCount);

  if (grammarItems.length > 0) {
    const grammarExercises: Exercise[] = [];
    for (const item of grammarItems) {
      const ex = generateGrammarExercise(item, grammar);
      if (ex) grammarExercises.push(ex);
    }

    if (grammarExercises.length > 0) {
      steps.push({
        type: 'learn',
        exercises: grammarExercises,
        label: 'Learn',
      });
    }
  }

  // --- Step 6: Read again (second i+1 sentence, different from first) ---
  if (sentences.length > 0) {
    const usedJapanese = firstReadSentences[0]?.japanese;
    const remainingSentences = sentences.filter(
      (s) => s.japanese !== usedJapanese,
    );
    const secondReadSentences = selectSentences(
      expandedKnownVocab,
      remainingSentences,
      1,
    );
    if (secondReadSentences.length > 0) {
      steps.push({
        type: 'read',
        exercises: [
          generateSentenceReadingExercise(secondReadSentences[0], sentences),
        ],
        label: 'Read',
      });
    }
  }

  // --- Step 7: Cooldown (i+0 sentence — "You can read this!") ---
  const cooldownSentence = selectCooldownSentence(expandedKnownVocab, sentences);
  if (cooldownSentence) {
    steps.push({
      type: 'cooldown',
      exercises: [generateSentenceReadingExercise(cooldownSentence, sentences)],
      label: 'You can read this!',
    });
  } else if (steps.length > 0) {
    // If there are no sentences at all but we do have learn steps, still end with
    // a meaningful cooldown using the first learned vocab item as a demonstration.
    const firstLearnedVocab = learnVocabItems[0];
    if (firstLearnedVocab) {
      steps.push({
        type: 'cooldown',
        exercises: [generateVocabExercise(firstLearnedVocab, vocab)],
        label: 'You can read this!',
      });
    }
  }

  const totalEstimatedMinutes = steps.length * 2;

  return { steps, totalEstimatedMinutes };
}
