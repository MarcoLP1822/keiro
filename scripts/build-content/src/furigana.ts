/**
 * Furigana annotator: tokenizes Japanese text and assigns hiragana readings
 * to kanji-containing tokens. Kana-only tokens receive reading: null to avoid
 * redundant furigana.
 *
 * Uses @sglkc/kuromoji directly — the kuroshiro wrapper is not needed for
 * simple per-token reading extraction.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FuriganaToken } from "@keiro/types";
import { initTokenizer, getTokenizer } from "./tokenizer.js";

export type { FuriganaToken };

// Kanji Unicode ranges: CJK Unified (4E00–9FFF), Extension A (3400–4DBF),
// and CJK Compatibility Ideographs (F900–FAFF).
const KANJI_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/;

function containsKanji(text: string): boolean {
  return KANJI_RE.test(text);
}

// Katakana U+30A1–U+30F6 → Hiragana U+3041–U+3096 (offset −0x60).
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Initialize the kuromoji tokenizer. Idempotent — safe to call multiple times.
 * Must be called once before annotateFurigana().
 *
 * @throws {Error} If the dictionary fails to load.
 */
export async function initFurigana(): Promise<void> {
  await initTokenizer();
}

/**
 * Annotate a Japanese string with per-token furigana readings.
 *
 * Each token is either:
 * - `{ text, reading: string }` — token contains kanji; reading is hiragana
 * - `{ text, reading: null }` — kana-only, punctuation, numbers, latin
 *
 * @throws {Error} If initFurigana() has not been called yet.
 */
export async function annotateFurigana(text: string): Promise<FuriganaToken[]> {
  const tokenizer = getTokenizer();
  const rawTokens = tokenizer.tokenize(text);

  return rawTokens.map((token) => {
    const surface = token.surface_form;

    if (containsKanji(surface) && token.reading) {
      return { text: surface, reading: katakanaToHiragana(token.reading) };
    }

    return { text: surface, reading: null };
  });
}

// When invoked directly via `tsx src/furigana.ts`, print a usage hint.
const isMain =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  console.log(
    "furigana.ts is a library module. Run `tsx src/test-furigana.ts` to test it."
  );
}
