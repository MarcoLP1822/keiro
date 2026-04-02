export interface ModuleIntro {
  title: string;
  explanation: string;
  cultureNote: string | null;
}

export interface KanaItem {
  character: string;
  romaji: string;
}

export interface VocabItem {
  word: string;          // Japanese word (kanji form if exists)
  reading: string;       // Hiragana reading
  meaning: string;       // English meaning
  partOfSpeech: string;  // noun, verb, adjective, adverb, etc.
  example?: {
    japanese: string;
    english: string;
  };
}

export interface GrammarItem {
  id: string;            // e.g., "n5-desu", "n5-particle-wa"
  title: string;         // e.g., "です (desu)"
  explanation: string;   // Brief explanation
  structure: string;     // e.g., "Noun + です"
  examples: {
    japanese: string;
    english: string;
  }[];
  notes?: string;        // Additional notes
}

export interface KanjiItem {
  kanji: string;         // The kanji character
  meanings: string[];    // English meanings
  onReading: string[];   // On'yomi readings in katakana
  kunReading: string[];  // Kun'yomi readings in hiragana
  strokeCount: number;
  example?: {
    word: string;        // Example word using this kanji
    reading: string;
    meaning: string;
  };
}

export type ContentItem = KanaItem | VocabItem | GrammarItem | KanjiItem;

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
