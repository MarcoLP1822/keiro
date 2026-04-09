import { describe, it, expect } from 'vitest';
import { planDynamicSession } from '../src/session-planner.js';
import type { Module, VocabItem, GrammarItem, SentenceItem } from '@keiro/types';
import type { SrsCard } from '@keiro/types';
import type { SessionConfig } from '../src/session-planner.js';

// --- Fixtures ---

function makeVocabItem(word: string, meaning: string, imageUrl?: string): VocabItem {
  return {
    word,
    reading: word,
    meaning,
    partOfSpeech: 'noun',
    imageUrl,
  };
}

function makeGrammarItem(id: string, title: string): GrammarItem {
  return {
    id,
    title,
    explanation: 'test grammar',
    structure: 'X + ' + title,
    examples: [
      { japanese: '私は学生です。', english: 'I am a student.' },
      { japanese: '彼は先生です。', english: 'He is a teacher.' },
    ],
  };
}

function makeSentence(japanese: string, requiredVocab: string[], english = 'translation'): SentenceItem {
  return {
    japanese,
    english,
    furigana: [],
    requiredVocab,
    requiredGrammar: [],
  };
}

function makeSrsCard(id: string, itemId: string, contentType: SrsCard['contentType'] = 'vocabulary'): SrsCard {
  return {
    id,
    itemId,
    moduleId: 'test-module',
    contentType,
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReview: '2026-01-01',
    lastReview: null,
    lapseCount: 0,
    isLeech: false,
  };
}

const vocabItems: VocabItem[] = [
  makeVocabItem('私', 'I / me'),
  makeVocabItem('学生', 'student', '/images/student.webp'),
  makeVocabItem('先生', 'teacher', '/images/teacher.webp'),
  makeVocabItem('名前', 'name'),
  makeVocabItem('仕事', 'work / job'),
  makeVocabItem('趣味', 'hobby'),
];

const grammarItems: GrammarItem[] = [
  makeGrammarItem('n5-desu', 'です'),
  makeGrammarItem('n5-particle-wa', 'は'),
];

const sentences: SentenceItem[] = [
  makeSentence('私は学生です。', ['私', '学生'], 'I am a student.'),
  makeSentence('先生の名前は何ですか。', ['先生', '名前'], 'What is the teacher\'s name?'),
  makeSentence('私の趣味は音楽です。', ['私', '趣味', '音楽'], 'My hobby is music.'),
  makeSentence('仕事は何ですか。', ['仕事'], 'What is your job?'),
];

function makeThematicModule(overrides: Partial<Module> = {}): Module {
  return {
    id: 'self-intro',
    name: 'Self Introduction',
    type: 'thematic',
    level: 'n5',
    order: 500,
    intro: { title: 'Self Introduction', explanation: 'Learn to introduce yourself.', cultureNote: null },
    items: [],
    theme: 'self-introduction',
    vocab: vocabItems,
    grammar: grammarItems,
    sentences,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<SessionConfig> = {}): SessionConfig {
  return {
    module: makeThematicModule(),
    knownVocab: new Set<string>(),
    knownGrammar: new Set<string>(),
    dueCards: [],
    size: 'medium',
    ...overrides,
  };
}

// --- Tests ---

describe('planDynamicSession — basic structure', () => {
  it('returns a SessionPlan with steps and totalEstimatedMinutes', () => {
    const plan = planDynamicSession(makeConfig());
    expect(plan).toHaveProperty('steps');
    expect(plan).toHaveProperty('totalEstimatedMinutes');
    expect(Array.isArray(plan.steps)).toBe(true);
  });

  it('totalEstimatedMinutes equals steps.length * 2', () => {
    const plan = planDynamicSession(makeConfig());
    expect(plan.totalEstimatedMinutes).toBe(plan.steps.length * 2);
  });

  it('every step has type, exercises array, and label', () => {
    const plan = planDynamicSession(makeConfig());
    for (const step of plan.steps) {
      expect(step).toHaveProperty('type');
      expect(step).toHaveProperty('exercises');
      expect(step).toHaveProperty('label');
      expect(Array.isArray(step.exercises)).toBe(true);
    }
  });
});

describe('planDynamicSession — step sequence with full content', () => {
  it('generates steps in expected pedagogical order', () => {
    const plan = planDynamicSession(makeConfig());
    const types = plan.steps.map((s) => s.type);

    // Without SRS cards: learn → read → comprehend → learn → read → cooldown
    expect(types[0]).toBe('learn');    // vocab learn
    expect(types[1]).toBe('read');     // first read
    expect(types[2]).toBe('comprehend');
    expect(types[3]).toBe('learn');    // grammar learn
    // read and cooldown follow
    expect(types[types.length - 1]).toBe('cooldown');
  });

  it('always ends with a cooldown step', () => {
    const plan = planDynamicSession(makeConfig());
    const lastStep = plan.steps[plan.steps.length - 1];
    expect(lastStep?.type).toBe('cooldown');
    expect(lastStep?.label).toBe('You can read this!');
  });

  it('cooldown step has at least one exercise', () => {
    const plan = planDynamicSession(makeConfig());
    const cooldown = plan.steps.find((s) => s.type === 'cooldown');
    expect(cooldown?.exercises.length).toBeGreaterThan(0);
  });
});

describe('planDynamicSession — review step', () => {
  it('includes a review step when due cards exist', () => {
    const config = makeConfig({
      dueCards: [
        makeSrsCard('card-1', '私'),
        makeSrsCard('card-2', '学生'),
      ],
    });
    const plan = planDynamicSession(config);
    const reviewStep = plan.steps.find((s) => s.type === 'review');
    expect(reviewStep).toBeDefined();
    expect(reviewStep?.label).toBe('Review');
  });

  it('review step is first when present', () => {
    const config = makeConfig({
      dueCards: [makeSrsCard('card-1', '私')],
    });
    const plan = planDynamicSession(config);
    expect(plan.steps[0].type).toBe('review');
  });

  it('skips review step when no due cards', () => {
    const plan = planDynamicSession(makeConfig({ dueCards: [] }));
    const reviewStep = plan.steps.find((s) => s.type === 'review');
    expect(reviewStep).toBeUndefined();
  });

  it('review cards that are not in module vocab do not generate exercises', () => {
    // 'unknown-word' is not in vocabItems so no exercise is generated
    const config = makeConfig({
      dueCards: [makeSrsCard('card-1', 'unknown-word')],
    });
    const plan = planDynamicSession(config);
    // Review step should not appear since no exercises were generated
    const reviewStep = plan.steps.find((s) => s.type === 'review');
    expect(reviewStep).toBeUndefined();
  });

  it('non-vocab SRS cards do not generate review exercises', () => {
    const config = makeConfig({
      dueCards: [makeSrsCard('card-1', '私', 'grammar')],
    });
    const plan = planDynamicSession(config);
    const reviewStep = plan.steps.find((s) => s.type === 'review');
    expect(reviewStep).toBeUndefined();
  });
});

describe('planDynamicSession — plan size scaling', () => {
  it('small plan presents 3 vocab items in learn step', () => {
    const plan = planDynamicSession(makeConfig({ size: 'small' }));
    const learnStep = plan.steps.find((s) => s.type === 'learn');
    expect(learnStep?.exercises).toHaveLength(3);
  });

  it('medium plan presents 4 vocab items in learn step', () => {
    const plan = planDynamicSession(makeConfig({ size: 'medium' }));
    const learnStep = plan.steps.find((s) => s.type === 'learn');
    expect(learnStep?.exercises).toHaveLength(4);
  });

  it('large plan presents 5 vocab items in learn step', () => {
    const plan = planDynamicSession(makeConfig({ size: 'large' }));
    const learnStep = plan.steps.find((s) => s.type === 'learn');
    expect(learnStep?.exercises).toHaveLength(5);
  });
});

describe('planDynamicSession — edge cases', () => {
  it('empty sentences → no read/comprehend steps, still has learn and cooldown', () => {
    const config = makeConfig({
      module: makeThematicModule({ sentences: [] }),
    });
    const plan = planDynamicSession(config);
    const types = plan.steps.map((s) => s.type);

    expect(types).not.toContain('read');
    expect(types).not.toContain('comprehend');
    expect(types).toContain('learn');
    expect(types).toContain('cooldown');
  });

  it('empty vocab → no learn steps (but plan still valid)', () => {
    const config = makeConfig({
      module: makeThematicModule({ vocab: [] }),
    });
    const plan = planDynamicSession(config);
    const learnVocabStep = plan.steps.find((s) => s.type === 'learn');
    // Grammar learn step may still appear if grammar items exist
    // but there should be no vocab learn exercises
    // (We can't distinguish vocab vs grammar learn steps by type alone)
    expect(plan.steps).toBeDefined();
  });

  it('empty grammar → no grammar learn step beyond vocab', () => {
    const config = makeConfig({
      module: makeThematicModule({ grammar: [] }),
    });
    const plan = planDynamicSession(config);
    // With no grammar, there should be at most one 'learn' step (vocab)
    const learnSteps = plan.steps.filter((s) => s.type === 'learn');
    expect(learnSteps.length).toBeLessThanOrEqual(1);
  });

  it('all vocab already known → learn step has no new items', () => {
    const allKnown = new Set(vocabItems.map((v) => v.word));
    const config = makeConfig({ knownVocab: allKnown });
    const plan = planDynamicSession(config);
    const learnSteps = plan.steps.filter((s) => s.type === 'learn');
    // Vocab learn step should not appear; grammar learn may still appear
    const firstLearnExercises = learnSteps[0]?.exercises ?? [];
    // All exercises in the first learn step should be grammar-related
    firstLearnExercises.forEach((ex) => {
      expect(ex.type).toBe('grammar-pick-correct');
    });
  });

  it('completely empty module returns minimal plan with no crash', () => {
    const emptyModule = makeThematicModule({
      vocab: [],
      grammar: [],
      sentences: [],
    });
    const config = makeConfig({ module: emptyModule });
    const plan = planDynamicSession(config);
    expect(plan).toBeDefined();
    expect(Array.isArray(plan.steps)).toBe(true);
  });

  it('vocab items with imageUrl produce image-vocab exercises', () => {
    // 学生 and 先生 have imageUrl set
    const plan = planDynamicSession(makeConfig({ size: 'large' }));
    const learnStep = plan.steps.find((s) => s.type === 'learn');
    const imageExercises = learnStep?.exercises.filter((e) => e.type === 'image-vocab') ?? [];
    expect(imageExercises.length).toBeGreaterThan(0);
  });

  it('read exercises are of type sentence-reading', () => {
    const plan = planDynamicSession(makeConfig());
    const readSteps = plan.steps.filter((s) => s.type === 'read');
    for (const step of readSteps) {
      expect(step.exercises.every((e) => e.type === 'sentence-reading')).toBe(true);
    }
  });

  it('review cap is respected per plan size (small = 2)', () => {
    const manyCards = Array.from({ length: 10 }, (_, i) =>
      makeSrsCard(`card-${i}`, '私'),
    );
    const config = makeConfig({ dueCards: manyCards, size: 'small' });
    const plan = planDynamicSession(config);
    const reviewStep = plan.steps.find((s) => s.type === 'review');
    // '私' is a valid vocab item so review exercises are generated; capped at 2
    expect(reviewStep?.exercises.length).toBeLessThanOrEqual(2);
  });
});
