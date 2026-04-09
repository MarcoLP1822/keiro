/**
 * Tatoeba sentence filter: takes raw JP-EN pairs and applies quality rules.
 *
 * Filtering rules:
 * 1. Japanese text must be between 3 and 200 characters
 * 2. Japanese text must contain at least one hiragana, katakana, or kanji character
 * 3. Sentence must contain at least one particle or verb-like ending (not a bare noun)
 */

export interface FilteredSentence {
  id: string;
  japanese: string;
  english: string;
  requiredVocab?: string[];
  jlptLevel?: string;
}

export interface RawPair {
  id: string;
  jpn: string;
  eng: string;
  author?: string;
  fluency?: number;
}

// Matches any hiragana, katakana, or kanji character.
const JAPANESE_CHAR_RE = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/;

// Common Japanese particles and verb endings that confirm sentence-hood.
// Hiragana particles: は、が、を、に、で、と、も、の、へ、か、よ、ね、な
// Common verb endings: する、した、です、ます、ました、ている、てい
const SENTENCE_MARKER_RE =
  /[はがをにでともへかよねな]|する|した|です|ます|ました|てい|から|まで|けど|けれど|ので|のに|ても|ながら/;

/**
 * Filter raw Tatoeba JP-EN pairs down to quality sentences.
 *
 * @param rawPairs - Raw pairs from the Tatoeba dataset
 * @returns Filtered sentences ready for further enrichment
 */
export function filterTatoebaSentences(rawPairs: RawPair[]): FilteredSentence[] {
  const total = rawPairs.length;
  let tooShort = 0;
  let tooLong = 0;
  let noJapanese = 0;
  let singleWord = 0;
  let passed = 0;

  const results: FilteredSentence[] = [];

  for (const pair of rawPairs) {
    const jpn = pair.jpn.trim();

    if (jpn.length <= 3) {
      tooShort++;
      continue;
    }

    if (jpn.length >= 200) {
      tooLong++;
      continue;
    }

    if (!JAPANESE_CHAR_RE.test(jpn)) {
      noJapanese++;
      continue;
    }

    if (!SENTENCE_MARKER_RE.test(jpn)) {
      singleWord++;
      continue;
    }

    results.push({
      id: pair.id,
      japanese: jpn,
      english: pair.eng.trim(),
    });

    passed++;
  }

  console.log(`[tatoeba-filter] Input: ${total} pairs`);
  console.log(`  Rejected — too short (≤3 chars):  ${tooShort}`);
  console.log(`  Rejected — too long (≥200 chars): ${tooLong}`);
  console.log(`  Rejected — no Japanese chars:     ${noJapanese}`);
  console.log(`  Rejected — single word/no marker: ${singleWord}`);
  console.log(`  Passed:                           ${passed}`);

  return results;
}
