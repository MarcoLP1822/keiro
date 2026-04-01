import type { Module, KanaItem, KanaContentFile } from '@keiro/types';
import hiraganaData from '../kana/hiragana.json' with { type: 'json' };
import katakanaData from '../kana/katakana.json' with { type: 'json' };

const hiragana = hiraganaData as KanaContentFile;
const katakana = katakanaData as KanaContentFile;

const allModules: Module[] = [
  ...hiragana.modules,
  ...katakana.modules,
].sort((a, b) => a.order - b.order);

/** All kana modules sorted by order (hiragana 1-10, katakana 11-20) */
export function getAllModules(): Module[] {
  return allModules;
}

/** Find a module by its unique id */
export function getModuleById(id: string): Module | undefined {
  return allModules.find((m) => m.id === id);
}

/** Flat array of all kana items across all modules (useful as distractor pool) */
export function getKanaItems(): KanaItem[] {
  return allModules.flatMap((m) => m.items as KanaItem[]);
}

/** Filter modules by type (e.g., 'kana', 'vocabulary') */
export function getModulesByType(type: string): Module[] {
  return allModules.filter((m) => m.type === type);
}
