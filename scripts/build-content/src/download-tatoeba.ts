/**
 * Downloads the pre-processed Tatoeba JP-EN sentence pairs from the
 * mwhirls/tatoeba-json GitHub repo. Falls back to a local cache file if
 * the network request fails, so the build can run offline after the first
 * successful download.
 *
 * Fail-loud: if both the download and the local fallback fail, the error
 * propagates — we never silently return empty data.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RawPair } from "./tatoeba-filter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_CACHE_PATH = path.join(__dirname, "../../data/jpn-eng.json");
const REMOTE_URL =
  "https://raw.githubusercontent.com/mwhirls/tatoeba-json/main/data/jpn-eng.json";

/**
 * Shape returned by the mwhirls/tatoeba-json dataset.
 * Each entry is a flat object with sentence id, text, translation, and metadata.
 */
interface TatoebaJsonEntry {
  id: number | string;
  text: string;
  translations: { text: string }[][];
  [key: string]: unknown;
}

function parseEntries(entries: TatoebaJsonEntry[]): RawPair[] {
  const pairs: RawPair[] = [];

  for (const entry of entries) {
    const jpn = entry.text?.trim();
    if (!jpn) continue;

    // translations is a nested array: outer = translation groups, inner = sentences.
    const engTexts: string[] = [];
    if (Array.isArray(entry.translations)) {
      for (const group of entry.translations) {
        if (Array.isArray(group)) {
          for (const t of group) {
            if (t?.text) engTexts.push(t.text.trim());
          }
        }
      }
    }

    // Use the first available English translation.
    const eng = engTexts[0];
    if (!eng) continue;

    pairs.push({
      id: String(entry.id),
      jpn,
      eng,
    });
  }

  return pairs;
}

/**
 * Download Tatoeba JP-EN pairs from the remote source, falling back to a
 * local cache when the network is unavailable.
 *
 * @returns Array of raw JP-EN pairs ready for filterTatoebaSentences()
 * @throws {Error} If both the remote download and local fallback fail
 */
export async function downloadTatoeba(): Promise<RawPair[]> {
  // Attempt remote download first.
  try {
    console.log(`[download-tatoeba] Fetching ${REMOTE_URL} …`);
    const response = await fetch(REMOTE_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as TatoebaJsonEntry[];
    const pairs = parseEntries(json);
    console.log(`[download-tatoeba] Downloaded ${pairs.length} pairs from remote.`);

    // Persist to local cache for offline use.
    await fs.mkdir(path.dirname(LOCAL_CACHE_PATH), { recursive: true });
    await fs.writeFile(LOCAL_CACHE_PATH, JSON.stringify(json), "utf-8");
    console.log(`[download-tatoeba] Cached to ${LOCAL_CACHE_PATH}`);

    return pairs;
  } catch (remoteErr) {
    console.warn(
      `[download-tatoeba] Remote download failed: ${String(remoteErr)}`
    );
    console.warn(`[download-tatoeba] Falling back to local cache: ${LOCAL_CACHE_PATH}`);
  }

  // Fallback: read the local cache.
  let raw: string;
  try {
    raw = await fs.readFile(LOCAL_CACHE_PATH, "utf-8");
  } catch (localErr) {
    throw new Error(
      `[download-tatoeba] Both remote download and local cache failed.\n` +
        `  Remote error: network unavailable or HTTP error\n` +
        `  Local error: ${String(localErr)}\n` +
        `  Expected cache at: ${LOCAL_CACHE_PATH}`
    );
  }

  const json = JSON.parse(raw) as TatoebaJsonEntry[];
  const pairs = parseEntries(json);
  console.log(
    `[download-tatoeba] Loaded ${pairs.length} pairs from local cache (degraded mode).`
  );

  return pairs;
}
