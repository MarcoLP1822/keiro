/**
 * Furigana annotator: tokenizes Japanese text and assigns hiragana readings
 * to kanji-containing tokens. Kana-only tokens receive reading: null to avoid
 * redundant furigana.
 *
 * Uses @sglkc/kuromoji directly — the kuroshiro wrapper is not needed for
 * simple per-token reading extraction.
 */

import kuromoji, { type Tokenizer, type IpadicFeatures } from "@sglkc/kuromoji";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface FuriganaToken {
  text: string;
  reading: string | null;
}

// Resolve the dict path from @sglkc/kuromoji's own installation location so
// this works regardless of the working directory when the script is invoked.
const _require = createRequire(import.meta.url);
const kuromojiMain = _require.resolve("@sglkc/kuromoji");
const DICT_PATH = path.join(path.dirname(kuromojiMain), "../dict");

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

let _tokenizer: Tokenizer<IpadicFeatures> | null = null;

/**
 * Initialize the kuromoji tokenizer. Idempotent — safe to call multiple times.
 * Must be called once before annotateFurigana().
 *
 * @throws {Error} If the dictionary fails to load.
 */
export async function initFurigana(): Promise<void> {
  if (_tokenizer !== null) return;

  await new Promise<void>((resolve, reject) => {
    kuromoji.builder({ dicPath: DICT_PATH }).build((err, tokenizer) => {
      if (err) {
        reject(new Error(`kuromoji init failed: ${String(err)}`));
        return;
      }
      _tokenizer = tokenizer;
      resolve();
    });
  });
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
  if (_tokenizer === null) {
    throw new Error(
      "Tokenizer not initialized. Call initFurigana() before annotateFurigana()."
    );
  }

  const rawTokens = _tokenizer.tokenize(text);

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
