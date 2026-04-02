export { calculateDailyPlan, getCurrentModule } from './daily-plan.js';
export type { PlanSize, DailyPlanConfig } from './daily-plan.js';

export { scoreModule, getModuleStatus } from './scoring.js';

export {
  generateKanaExercises,
  generateAudioExercises,
  generateVocabExercises,
  generateKanjiExercises,
  generateGrammarExercises,
  createMultipleChoice,
  shuffle,
} from './exercises.js';

export { generatePlacementQuiz, evaluatePlacement } from './placement.js';
export type { PlacementResult } from './placement.js';
