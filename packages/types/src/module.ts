export interface ModuleIntro {
  title: string;
  explanation: string;
  cultureNote: string | null;
}

export interface KanaItem {
  character: string;
  romaji: string;
}

// Extensible union — add VocabItem, GrammarItem, etc. as needed
export type ContentItem = KanaItem;

export type ModuleType = 'kana' | 'vocabulary' | 'grammar' | 'kanji' | 'reading';
export type ModuleLevel = 'beginner' | 'n5' | 'n4' | 'n3';

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  level: ModuleLevel;
  order: number;
  intro: ModuleIntro;
  items: ContentItem[];
}

/** Shape of the kana JSON files (hiragana.json, katakana.json) */
export interface KanaContentFile {
  script: string;
  modules: Module[];
}
