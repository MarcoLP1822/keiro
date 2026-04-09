import type { ContentItem, FuriganaToken } from './module.js';

export type KanaExerciseType = 'char-to-romaji' | 'romaji-to-char' | 'audio-to-char';
export type VocabExerciseType = 'word-to-meaning' | 'meaning-to-word' | 'sentence-gap-fill' | 'typing-meaning';
export type GrammarExerciseType = 'grammar-sentence-order' | 'grammar-pick-correct';
export type KanjiExerciseType = 'kanji-to-meaning' | 'kanji-to-reading' | 'typing-reading';
export type ReadingExerciseType = 'reading-comprehension' | 'reading-translation';
export type ThematicExerciseType = 'image-vocab' | 'sentence-reading';

export type ExerciseType =
  | KanaExerciseType
  | VocabExerciseType
  | GrammarExerciseType
  | KanjiExerciseType
  | ReadingExerciseType
  | ThematicExerciseType;

export interface Exercise {
  type: ExerciseType;
  question: string;           // The main question content
  questionDetail?: string;    // Additional context (e.g., furigana, sentence context)
  // Multiple choice (existing)
  options: string[];
  correctIndex: number;
  // For typing exercises
  correctAnswer?: string;
  // For sentence ordering
  scrambledWords?: string[];
  correctOrder?: string[];
  // For gap-fill
  sentenceWithGap?: string;   // "私は___を食べます" (gap marked with ___)
  // For image-vocab exercises
  imageUrl?: string;
  // For sentence-reading exercises
  furiganaTokens?: FuriganaToken[];
  // Reference item
  targetItem: ContentItem;
}

export interface SessionStep {
  type: 'review' | 'learn' | 'read' | 'comprehend' | 'cooldown';
  exercises: Exercise[];
  label: string;
}

export interface SessionPlan {
  steps: SessionStep[];
  totalEstimatedMinutes: number;
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
