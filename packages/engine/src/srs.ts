import type { SrsCard, SrsGrade } from '@keiro/types';
import { localDateString } from './dates.js';

/** Number of wrong answers before a card is flagged as a leech */
const LEECH_THRESHOLD = 4;

/**
 * SM-2 spaced repetition algorithm.
 * Grades a card and returns the updated card with new interval, ease factor, and next review date.
 */
export function gradeSrsCard(card: SrsCard, grade: SrsGrade, today?: string): SrsCard {
  // Map grade to SM-2 quality (0-5 scale)
  const quality = grade === 'easy' ? 5 : grade === 'hard' ? 3 : 1;

  let { interval, repetitions, easeFactor } = card;
  let lapseCount = card.lapseCount ?? 0;
  let isLeech = card.isLeech ?? false;

  if (quality >= 3) {
    // Correct answer (hard or easy)
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;

    // Clear leech status on easy grade
    if (grade === 'easy' && isLeech) {
      isLeech = false;
    }
  } else {
    // Wrong — reset to beginning
    repetitions = 0;
    interval = 1;
    lapseCount += 1;
    if (lapseCount >= LEECH_THRESHOLD) {
      isLeech = true;
    }
  }

  // Adjust ease factor using SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nowStr = today || localDateString();
  const next = new Date(nowStr + 'T00:00:00');
  next.setDate(next.getDate() + interval);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReview: localDateString(next),
    lastReview: nowStr,
    lapseCount,
    isLeech,
  };
}

/**
 * Creates a new SRS card for a content item. Starts with default SM-2 values.
 */
export function createSrsCard(
  itemId: string,
  moduleId: string,
  contentType: SrsCard['contentType'],
  today?: string,
): SrsCard {
  const todayStr = today || localDateString();
  return {
    id: `${moduleId}-${itemId}`,
    itemId,
    moduleId,
    contentType,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: todayStr,
    lastReview: null,
    lapseCount: 0,
    isLeech: false,
  };
}

/**
 * Returns all cards flagged as leeches (items the user keeps getting wrong).
 */
export function getLeechCards(cards: SrsCard[]): SrsCard[] {
  return cards.filter((c) => c.isLeech);
}

/**
 * Returns cards that are due for review on or before the given date,
 * sorted by most overdue first, then by lowest ease factor.
 */
export function getDueCards(cards: SrsCard[], date?: string): SrsCard[] {
  const today = date || localDateString();
  return cards
    .filter((c) => c.nextReview <= today)
    .sort((a, b) => {
      if (a.nextReview !== b.nextReview) return a.nextReview.localeCompare(b.nextReview);
      return a.easeFactor - b.easeFactor;
    });
}
