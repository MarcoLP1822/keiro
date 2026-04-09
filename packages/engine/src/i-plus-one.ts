import type { SentenceItem } from '@keiro/types';

/**
 * Scores a sentence against the learner's known vocabulary.
 *
 * Priority mapping (lower = better):
 *   i+1 (exactly 1 unknown) → 1  — ideal comprehensible input
 *   i+0 (all known)         → 2  — useful reinforcement
 *   i+2 (2 unknowns)        → 3
 *   i+N (N unknowns)        → N+1 — higher = harder to comprehend
 */
function scoreSentence(sentence: SentenceItem, knownVocab: Set<string>): number {
  const unknownCount = sentence.requiredVocab.filter((v) => !knownVocab.has(v)).length;
  if (unknownCount === 1) return 1; // i+1: optimal
  if (unknownCount === 0) return 2; // i+0: reinforcement
  return unknownCount + 1;          // i+2 → 3, i+3 → 4, etc.
}

/**
 * Selects the best sentences from a pool for a learner's current vocabulary level.
 *
 * Implements Krashen's i+1 hypothesis: sentences with exactly one unknown word
 * are prioritised as they provide the most effective comprehensible input.
 * Ties are broken by sentence length (shorter = more accessible for beginners).
 *
 * @param knownVocab - Set of dictionary-form words the learner already knows
 * @param sentencePool - Candidate sentences to select from
 * @param count - Number of sentences to return
 * @returns Up to `count` sentences sorted by i+1 fitness; empty if pool is empty
 */
export function selectSentences(
  knownVocab: Set<string>,
  sentencePool: SentenceItem[],
  count: number,
): SentenceItem[] {
  if (sentencePool.length === 0) return [];

  return [...sentencePool]
    .sort((a, b) => {
      const scoreDiff = scoreSentence(a, knownVocab) - scoreSentence(b, knownVocab);
      if (scoreDiff !== 0) return scoreDiff;
      // Break ties by length: shorter sentences are easier for beginners
      return a.japanese.length - b.japanese.length;
    })
    .slice(0, count);
}
