/**
 * Vocab tokenization for filtered Tatoeba sentences.
 *
 * For each sentence we:
 * 1. Tokenize the Japanese text with kuromoji
 * 2. Extract the base_form (dictionary form) of each token
 * 3. Keep only content words — drop particles (助詞), auxiliary verbs (助動詞),
 *    punctuation (記号), and the special "BOS/EOS" boundary tokens.
 * 4. Store the unique dictionary forms as requiredVocab[] on the sentence.
 */

import type { FilteredSentence } from "./tatoeba-filter.js";
import { initTokenizer, getTokenizer } from "./tokenizer.js";

// IPAdic part-of-speech tags to exclude from requiredVocab.
// These are grammatical function words, not content vocabulary.
const EXCLUDED_POS = new Set([
  "助詞",     // particles (は、が、を …)
  "助動詞",   // auxiliary verbs (です、ます …)
  "記号",     // symbols / punctuation
  "空白",     // whitespace tokens
  "BOS/EOS",  // boundary markers
  "フィラー", // filler words
]);

/**
 * Tokenize a batch of filtered sentences and populate the requiredVocab field
 * on each one with the dictionary forms of their content words.
 *
 * @param sentences - Output of filterTatoebaSentences()
 * @returns The same sentences with requiredVocab populated
 * @throws {Error} If kuromoji fails to initialise
 */
export async function tokenizeSentences(
  sentences: FilteredSentence[]
): Promise<FilteredSentence[]> {
  await initTokenizer();
  const tokenizer = getTokenizer();

  const enriched: FilteredSentence[] = [];

  for (const sentence of sentences) {
    const tokens = tokenizer.tokenize(sentence.japanese);

    const vocabSet = new Set<string>();

    for (const token of tokens) {
      const pos = token.pos; // e.g. "名詞", "動詞", "助詞" …

      if (EXCLUDED_POS.has(pos)) continue;

      // Use base_form (dictionary form) when available; fall back to surface.
      const base =
        token.basic_form && token.basic_form !== "*"
          ? token.basic_form
          : token.surface_form;

      if (base && base.trim().length > 0) {
        vocabSet.add(base);
      }
    }

    enriched.push({
      ...sentence,
      requiredVocab: Array.from(vocabSet),
    });
  }

  console.log(
    `[tokenize-sentences] Tokenized ${enriched.length} sentences.`
  );

  return enriched;
}
