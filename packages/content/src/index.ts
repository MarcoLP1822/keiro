import type {
  Module,
  KanaItem,
  VocabItem,
  KanjiItem,
  GrammarItem,
  KanaContentFile,
  VocabContentFile,
  KanjiContentFile,
  GrammarContentFile,
} from '@keiro/types';
import hiraganaData from '../kana/hiragana.json' with { type: 'json' };
import katakanaData from '../kana/katakana.json' with { type: 'json' };
import vocabN5Data from '../vocabulary/n5.json' with { type: 'json' };
import kanjiN5Data from '../kanji/n5.json' with { type: 'json' };
import grammarN5Data from '../grammar/n5.json' with { type: 'json' };

const hiragana = hiraganaData as KanaContentFile;
const katakana = katakanaData as KanaContentFile;
const vocabN5 = vocabN5Data as VocabContentFile;
const kanjiN5 = kanjiN5Data as KanjiContentFile;
const grammarN5 = grammarN5Data as GrammarContentFile;

const allModules: Module[] = [
  ...hiragana.modules,
  ...katakana.modules,
  ...vocabN5.modules,
  ...kanjiN5.modules,
  ...grammarN5.modules,
].sort((a, b) => a.order - b.order);

/** All modules sorted by order (kana, vocab, kanji, grammar) */
export function getAllModules(): Module[] {
  return allModules;
}

/** Find a module by its unique id */
export function getModuleById(id: string): Module | undefined {
  return allModules.find((m) => m.id === id);
}

/** Flat array of all kana items across all modules (useful as distractor pool) */
export function getKanaItems(): KanaItem[] {
  return allModules
    .filter((m) => m.type === 'kana')
    .flatMap((m) => m.items as KanaItem[]);
}

/** Flat array of all vocab items across all modules */
export function getVocabItems(): VocabItem[] {
  return allModules
    .filter((m) => m.type === 'vocabulary')
    .flatMap((m) => m.items as VocabItem[]);
}

/** Flat array of all kanji items across all modules */
export function getKanjiItems(): KanjiItem[] {
  return allModules
    .filter((m) => m.type === 'kanji')
    .flatMap((m) => m.items as KanjiItem[]);
}

/** Flat array of all grammar items across all modules */
export function getGrammarItems(): GrammarItem[] {
  return allModules
    .filter((m) => m.type === 'grammar')
    .flatMap((m) => m.items as GrammarItem[]);
}

/** Filter modules by type (e.g., 'kana', 'vocabulary') */
export function getModulesByType(type: string): Module[] {
  return allModules.filter((m) => m.type === type);
}

/** Filter modules by level (e.g., 'n5', 'beginner') */
export function getModulesByLevel(level: string): Module[] {
  return allModules.filter((m) => m.level === level);
}
