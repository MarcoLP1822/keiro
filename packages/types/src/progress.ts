export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'passed' | 'failed';

export interface ModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  score: number | null;
  completedAt: string | null;
  attempts: number;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  modules: string[];
  completed: boolean;
}

export interface Setting {
  key: string;
  value: string | number | boolean;
}

export interface PlannedSession {
  modules: string[];
  estimatedMinutes: number;
  newItemCount: number;
  reviewCount: number;
  reviewCards: string[];
  isComplete: boolean;
}

export interface SrsCard {
  id: string;
  itemId: string;
  moduleId: string;
  contentType: 'kana' | 'vocabulary' | 'grammar' | 'kanji';
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: string;
  lastReview: string | null;
}

export type SrsGrade = 'wrong' | 'hard' | 'easy';
