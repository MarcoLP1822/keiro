import type { ContentItem } from './module.js';

export type ExerciseType = 'char-to-romaji' | 'romaji-to-char' | 'audio-to-char';

export interface Exercise {
  type: ExerciseType;
  question: string;
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
