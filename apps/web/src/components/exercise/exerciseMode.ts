export type ExerciseMode = 'multiple-choice' | 'gap-fill' | 'typing' | 'sentence-order' | 'reading' | 'image';

export function getExerciseMode(type: string): ExerciseMode {
  switch (type) {
    case 'sentence-gap-fill':
      return 'gap-fill';
    case 'typing-meaning':
    case 'typing-reading':
      return 'typing';
    case 'grammar-sentence-order':
      return 'sentence-order';
    case 'reading-comprehension':
    case 'reading-translation':
      return 'reading';
    case 'sentence-reading':
      return 'reading';
    case 'image-vocab':
      return 'image';
    default:
      return 'multiple-choice';
  }
}
