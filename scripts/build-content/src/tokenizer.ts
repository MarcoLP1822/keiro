/**
 * Shared kuromoji tokenizer initialization.
 *
 * Centralises the dict-path resolution and builder pattern so that
 * furigana.ts and tokenize-sentences.ts do not duplicate the setup code.
 * The tokenizer is initialised at most once per process (idempotent).
 */

import kuromoji, { type Tokenizer, type IpadicFeatures } from "@sglkc/kuromoji";
import { createRequire } from "node:module";
import path from "node:path";

// Resolve the dict path from @sglkc/kuromoji's own installation location so
// this works regardless of the working directory when the script is invoked.
const _require = createRequire(import.meta.url);
const kuromojiMain = _require.resolve("@sglkc/kuromoji");
const DICT_PATH = path.join(path.dirname(kuromojiMain), "../dict");

let _tokenizer: Tokenizer<IpadicFeatures> | null = null;

/**
 * Initialise the kuromoji tokenizer. Idempotent — safe to call multiple times.
 *
 * @throws {Error} If the dictionary fails to load.
 */
export async function initTokenizer(): Promise<void> {
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
 * Returns the initialised tokenizer instance.
 *
 * @throws {Error} If initTokenizer() has not been called yet.
 */
export function getTokenizer(): Tokenizer<IpadicFeatures> {
  if (_tokenizer === null) {
    throw new Error(
      "Tokenizer not initialized. Call initTokenizer() before getTokenizer()."
    );
  }
  return _tokenizer;
}
