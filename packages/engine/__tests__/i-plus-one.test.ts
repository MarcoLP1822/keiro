import { describe, it, expect } from 'vitest';
import { selectSentences } from '../src/i-plus-one.js';
import type { SentenceItem } from '@keiro/types';

function makeSentence(
  japanese: string,
  requiredVocab: string[],
  english = 'translation',
): SentenceItem {
  return {
    japanese,
    english,
    furigana: [],
    requiredVocab,
    requiredGrammar: [],
  };
}

describe('selectSentences', () => {
  it('returns empty array when pool is empty', () => {
    const result = selectSentences(new Set(['私', '学生']), [], 5);
    expect(result).toEqual([]);
  });

  it('selects i+1 sentence first when one is available', () => {
    const known = new Set(['私', '学生', '先生']);
    const sentences = [
      makeSentence('私は先生が好きです。', ['私', '先生', '好き']), // i+1: '好き' unknown
      makeSentence('私は学生です。', ['私', '学生']),               // i+0: all known
      makeSentence('映画と音楽が好きです。', ['映画', '音楽', '好き']), // i+3: three unknown
    ];

    const result = selectSentences(known, sentences, 3);

    // i+1 sentence should be first
    expect(result[0].japanese).toBe('私は先生が好きです。');
  });

  it('falls back to i+0 when no i+1 sentence is available', () => {
    const known = new Set(['私', '学生', '先生', '好き']);
    const sentences = [
      makeSentence('映画と音楽が好きです。', ['映画', '音楽', '好き']), // i+2: two unknown
      makeSentence('私は学生です。', ['私', '学生']),                    // i+0: all known
    ];

    const result = selectSentences(known, sentences, 2);

    // i+0 ranked above i+2
    expect(result[0].japanese).toBe('私は学生です。');
  });

  it('among multiple i+1 sentences, shorter ones come first', () => {
    const known = new Set(['私', '学生', '先生']);
    // Both sentences have exactly one unknown: '好き' and '趣味' respectively
    const shortI1 = makeSentence('好きです。', ['好き']);                    // i+1, 4 chars
    const longI1 = makeSentence('私は趣味があります。', ['私', '趣味']);    // i+1, 10 chars

    const result = selectSentences(known, [longI1, shortI1], 2);

    // Both are i+1 (one unknown each), shorter one first
    expect(result[0].japanese).toBe('好きです。');
    expect(result[1].japanese).toBe('私は趣味があります。');
  });

  it('all i+2+ sentences ranked by unknown count ascending', () => {
    const known = new Set<string>();
    const sentences = [
      makeSentence('映画。', ['映画']),                        // i+1
      makeSentence('音楽と映画。', ['音楽', '映画']),          // i+2
      makeSentence('音楽と映画と料理。', ['音楽', '映画', '料理']), // i+3
    ];

    const result = selectSentences(known, sentences, 3);

    expect(result[0].japanese).toBe('映画。');         // i+1 first
    expect(result[1].japanese).toBe('音楽と映画。');   // i+2 second
    expect(result[2].japanese).toBe('音楽と映画と料理。'); // i+3 last
  });

  it('returns fewer than count when pool is smaller', () => {
    const known = new Set(['私']);
    const sentences = [makeSentence('私です。', ['私'])];
    const result = selectSentences(known, sentences, 10);
    expect(result).toHaveLength(1);
  });

  it('does not mutate the original pool array', () => {
    const known = new Set(['私']);
    const sentences = [
      makeSentence('映画です。', ['映画']),
      makeSentence('私です。', ['私']),
    ];
    const originalOrder = sentences.map((s) => s.japanese);
    selectSentences(known, sentences, 2);
    expect(sentences.map((s) => s.japanese)).toEqual(originalOrder);
  });
});
