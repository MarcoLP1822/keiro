export interface FuriganaToken {
  text: string;
  reading: string | null;
}

export interface SentenceItem {
  japanese: string;
  english: string;
  furigana: FuriganaToken[];
  requiredVocab: string[];
  requiredGrammar: string[];
}

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
  imageUrl?: string;
  examples?: {
    japanese: string;
    english: string;
    furigana?: FuriganaToken[];
  }[];
}

export interface GrammarItem {
  id: string;            // e.g., "n5-desu", "n5-particle-wa"
  title: string;         // e.g., "です (desu)"
  explanation: string;   // Brief explanation
  structure: string;     // e.g., "Noun + です"
  examples: {
    japanese: string;
    english: string;
    furigana?: FuriganaToken[];
  }[];
  notes?: string | null;  // Additional notes
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

export interface ReadingQuestion {
  question: string;          // English question about the passage
  options: string[];         // 4 answer options (English)
  correctIndex: number;
}

export interface ReadingItem {
  passage: string;           // Japanese text
  translation: string;       // English translation of full passage
  furigana?: FuriganaToken[]; // Pre-computed furigana tokens for the passage
  questions: ReadingQuestion[];
}

export type ContentItem = KanaItem | VocabItem | GrammarItem | KanjiItem | ReadingItem | SentenceItem;

export type ModuleType = 'kana' | 'vocabulary' | 'grammar' | 'kanji' | 'reading' | 'thematic';
export type ModuleLevel = 'beginner' | 'n5' | 'n4' | 'n3';

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  level: ModuleLevel;
  order: number;
  intro: ModuleIntro;
  items: ContentItem[];
  theme?: string;
  // Thematic module content collections (used when type === 'thematic')
  vocab?: VocabItem[];
  grammar?: GrammarItem[];
  sentences?: SentenceItem[];
  readings?: ReadingItem[];
}

/** Shape of the kana JSON files (hiragana.json, katakana.json) */
export interface KanaContentFile {
  script: string;
  modules: Module[];
}

/** Shape of vocab JSON files (e.g., vocabulary/n5.json) */
export interface VocabContentFile {
  level: string;
  modules: Module[];
}

/** Shape of kanji JSON files (e.g., kanji/n5.json) */
export interface KanjiContentFile {
  level: string;
  modules: Module[];
}

/** Shape of grammar JSON files (e.g., grammar/n5.json) */
export interface GrammarContentFile {
  _attribution?: string;
  level: string;
  modules: Module[];
}

/** Shape of reading JSON files (e.g., reading/n5.json) */
export interface ReadingContentFile {
  level: string;
  modules: Module[];
}

/** Shape of thematic module JSON files (e.g., themes/self-introduction.json) */
export interface ThematicContentFile {
  level: string;
  modules: Module[];
}
