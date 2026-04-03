import { describe, it, expect } from 'vitest';
import { gradeSrsCard, createSrsCard, getDueCards, getLeechCards } from '../src/srs.js';
import type { SrsCard } from '@keiro/types';

function makeCard(overrides: Partial<SrsCard> = {}): SrsCard {
  return {
    id: 'mod-1-word',
    itemId: 'word',
    moduleId: 'mod-1',
    contentType: 'vocabulary',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: '2026-01-01',
    lastReview: null,
    lapseCount: 0,
    isLeech: false,
    ...overrides,
  };
}

describe('createSrsCard', () => {
  it('creates a card with default SM-2 values', () => {
    const card = createSrsCard('hello', 'vocab-1', 'vocabulary', '2026-03-15');
    expect(card.id).toBe('vocab-1-hello');
    expect(card.itemId).toBe('hello');
    expect(card.moduleId).toBe('vocab-1');
    expect(card.contentType).toBe('vocabulary');
    expect(card.interval).toBe(0);
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(card.nextReview).toBe('2026-03-15');
    expect(card.lastReview).toBeNull();
    expect(card.lapseCount).toBe(0);
    expect(card.isLeech).toBe(false);
  });
});

describe('gradeSrsCard', () => {
  it('grade "easy" on a new card sets interval to 1, then 6', () => {
    const card = makeCard();
    const after1 = gradeSrsCard(card, 'easy', '2026-01-01');
    expect(after1.interval).toBe(1);
    expect(after1.repetitions).toBe(1);
    expect(after1.nextReview).toBe('2026-01-02');
    expect(after1.lastReview).toBe('2026-01-01');
    // Ease factor goes up for quality=5
    expect(after1.easeFactor).toBeGreaterThan(2.5);

    const after2 = gradeSrsCard(after1, 'easy', '2026-01-02');
    expect(after2.interval).toBe(6);
    expect(after2.repetitions).toBe(2);
  });

  it('grade "easy" after rep 2 uses ease factor multiplier', () => {
    const card = makeCard({ interval: 6, repetitions: 2, easeFactor: 2.5 });
    const after = gradeSrsCard(card, 'easy', '2026-01-07');
    // 6 * 2.5 = 15
    expect(after.interval).toBe(15);
    expect(after.repetitions).toBe(3);
  });

  it('grade "hard" on a new card sets interval to 1', () => {
    const card = makeCard();
    const after = gradeSrsCard(card, 'hard', '2026-01-01');
    expect(after.interval).toBe(1);
    expect(after.repetitions).toBe(1);
    // Ease factor decreases for quality=3
    expect(after.easeFactor).toBeLessThan(2.5);
  });

  it('grade "hard" decreases ease factor but not below 1.3', () => {
    const card = makeCard({ easeFactor: 1.3, interval: 6, repetitions: 2 });
    const after = gradeSrsCard(card, 'hard', '2026-01-01');
    expect(after.easeFactor).toBe(1.3);
  });

  it('grade "wrong" resets repetitions and interval to 1', () => {
    const card = makeCard({ interval: 15, repetitions: 3, easeFactor: 2.6 });
    const after = gradeSrsCard(card, 'wrong', '2026-01-16');
    expect(after.interval).toBe(1);
    expect(after.repetitions).toBe(0);
    expect(after.nextReview).toBe('2026-01-17');
  });

  it('grade "wrong" reduces ease factor significantly', () => {
    const card = makeCard({ easeFactor: 2.5 });
    const after = gradeSrsCard(card, 'wrong', '2026-01-01');
    // quality=1 => EF + 0.1 - (4)*(0.08 + (4)*0.02) = EF + 0.1 - 0.64 = EF - 0.54
    expect(after.easeFactor).toBeLessThan(2.0);
  });

  it('ease factor never goes below 1.3', () => {
    const card = makeCard({ easeFactor: 1.4 });
    const after = gradeSrsCard(card, 'wrong', '2026-01-01');
    expect(after.easeFactor).toBe(1.3);
  });
});

describe('getDueCards', () => {
  it('returns cards due on or before the given date', () => {
    const cards = [
      makeCard({ id: 'a', nextReview: '2026-01-01' }),
      makeCard({ id: 'b', nextReview: '2026-01-05' }),
      makeCard({ id: 'c', nextReview: '2026-01-10' }),
    ];
    const due = getDueCards(cards, '2026-01-05');
    expect(due.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('returns empty array when no cards are due', () => {
    const cards = [
      makeCard({ id: 'a', nextReview: '2026-02-01' }),
    ];
    const due = getDueCards(cards, '2026-01-01');
    expect(due).toEqual([]);
  });

  it('sorts by most overdue first, then by lowest ease factor', () => {
    const cards = [
      makeCard({ id: 'b', nextReview: '2026-01-03', easeFactor: 2.0 }),
      makeCard({ id: 'a', nextReview: '2026-01-01', easeFactor: 2.5 }),
      makeCard({ id: 'c', nextReview: '2026-01-03', easeFactor: 1.5 }),
    ];
    const due = getDueCards(cards, '2026-01-05');
    expect(due.map((c) => c.id)).toEqual(['a', 'c', 'b']);
  });

  it('returns all cards when all are overdue', () => {
    const cards = [
      makeCard({ id: 'a', nextReview: '2025-12-01' }),
      makeCard({ id: 'b', nextReview: '2025-12-15' }),
    ];
    const due = getDueCards(cards, '2026-01-01');
    expect(due).toHaveLength(2);
  });
});

describe('leech detection', () => {
  it('increments lapseCount on wrong grade', () => {
    const card = makeCard();
    const after = gradeSrsCard(card, 'wrong', '2026-01-01');
    expect(after.lapseCount).toBe(1);
    expect(after.isLeech).toBe(false);
  });

  it('flags card as leech after 4 wrong answers', () => {
    let card = makeCard();
    for (let i = 0; i < 3; i++) {
      card = gradeSrsCard(card, 'wrong', '2026-01-01');
    }
    expect(card.lapseCount).toBe(3);
    expect(card.isLeech).toBe(false);

    card = gradeSrsCard(card, 'wrong', '2026-01-01');
    expect(card.lapseCount).toBe(4);
    expect(card.isLeech).toBe(true);
  });

  it('does not increment lapseCount on correct grades', () => {
    const card = makeCard({ lapseCount: 2 });
    const afterEasy = gradeSrsCard(card, 'easy', '2026-01-01');
    expect(afterEasy.lapseCount).toBe(2);

    const afterHard = gradeSrsCard(card, 'hard', '2026-01-01');
    expect(afterHard.lapseCount).toBe(2);
  });

  it('clears leech status on easy grade', () => {
    const card = makeCard({ lapseCount: 5, isLeech: true, repetitions: 0 });
    const after = gradeSrsCard(card, 'easy', '2026-01-01');
    expect(after.isLeech).toBe(false);
    expect(after.lapseCount).toBe(5); // lapseCount is not reset
  });

  it('does not clear leech status on hard grade', () => {
    const card = makeCard({ lapseCount: 5, isLeech: true, repetitions: 0 });
    const after = gradeSrsCard(card, 'hard', '2026-01-01');
    expect(after.isLeech).toBe(true);
  });
});

describe('getLeechCards', () => {
  it('returns only leech cards', () => {
    const cards = [
      makeCard({ id: 'a', isLeech: true }),
      makeCard({ id: 'b', isLeech: false }),
      makeCard({ id: 'c', isLeech: true }),
    ];
    const leeches = getLeechCards(cards);
    expect(leeches.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('returns empty array when no leeches', () => {
    const cards = [
      makeCard({ id: 'a', isLeech: false }),
    ];
    expect(getLeechCards(cards)).toEqual([]);
  });
});
