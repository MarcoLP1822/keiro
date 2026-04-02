import type { ContentItem } from './module.js';

export type KanaExerciseType = 'char-to-romaji' | 'romaji-to-char' | 'audio-to-char';
export type VocabExerciseType = 'word-to-meaning' | 'meaning-to-word' | 'sentence-gap-fill';
export type GrammarExerciseType = 'grammar-correct-form' | 'grammar-sentence-order' | 'grammar-pick-correct';
export type KanjiExerciseType = 'kanji-to-meaning' | 'kanji-to-reading' | 'reading-to-kanji';

export type ExerciseType =
  | KanaExerciseType
  | VocabExerciseType
  | GrammarExerciseType
  | KanjiExerciseType;

export interface Exercise {
  type: ExerciseType;
  question: string;           // The main question content
  questionDetail?: string;    // Additional context (e.g., furigana, sentence context)
  options: string[];
  correctIndex: number;
  targetItem: ContentItem;
}

export interface AnswerOption {
  label: string;
  value: string;
}

export interface Answer {
  exerciseIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  exercise: Exercise;
}

export interface ModuleScore {
  score: number; // 0-100
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  mistakes: Answer[];
}
