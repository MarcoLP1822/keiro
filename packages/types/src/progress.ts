export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'passed' | 'failed';

export interface ModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  score: number | null;
  completedAt: string | null;
  attempts: number;
  updatedAt?: string;
  userId?: string | null;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  modules: string[];
  completed: boolean;
  updatedAt?: string;
  userId?: string | null;
}

export interface Setting {
  key: string;
  value: string | number | boolean;
  updatedAt?: string;
  userId?: string | null;
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
  lapseCount: number;
  isLeech: boolean;
  updatedAt?: string;
  userId?: string | null;
}

export type SrsGrade = 'wrong' | 'hard' | 'easy';

export interface StreakData {
  id: string;                   // always 'current'
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  freezesAvailable: number;     // earned by completing 7-day streaks
  freezesUsed: string[];        // dates where freeze was auto-applied
}
