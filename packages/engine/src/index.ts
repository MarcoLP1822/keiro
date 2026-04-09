export { localDateString } from './dates.js';

export { calculateDailyPlan, getCurrentModule, isThematic } from './daily-plan.js';
export type { PlanSize } from './daily-plan.js';

export { scoreModule, getModuleStatus } from './scoring.js';

export {
  generateKanaExercises,
  generateAudioExercises,
  generateVocabExercises,
  generateKanjiExercises,
  generateGrammarExercises,
  generateReadingExercises,
  generateImageExercise,
  generateSentenceReadingExercise,
  createMultipleChoice,
  shuffle,
} from './exercises.js';

export { selectSentences } from './i-plus-one.js';

export { planDynamicSession } from './session-planner.js';
export type { SessionConfig } from './session-planner.js';

export { generatePlacementQuiz, evaluatePlacement } from './placement.js';

export { gradeSrsCard, createSrsCard, getDueCards, getLeechCards } from './srs.js';

export { updateStreak, createDefaultStreakData } from './streak.js';
