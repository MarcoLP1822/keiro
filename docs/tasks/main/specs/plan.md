# Implementation Plan: Reading-First Keiro

## Overview

Transform Keiro from a quiz-based Duolingo clone into a reading-first "Kindle for learning Japanese." The core change: every study session contains a reading moment — users read real Japanese from day one. Content is reorganized thematically (Self-Introduction, Animals, Food...) instead of by JLPT content type. New exercise types (image-based, sentence building with furigana) reinforce reading goals.

**Approach**: Vertical Slice — build one complete topic end-to-end, validate, then scale.

**Pilot topic**: Self-Introduction (自己紹介) — the universally first lesson in Japanese learning, uses basic vocab/grammar, and is immediately relatable.

## Current State

- Content is organized by JLPT type: all vocab → all kanji → all grammar → reading (at the end)
- 3,524 vocab items with zero example sentences
- 40 micro-reading passages (1-4 sentences each), isolated at the end of each level
- `useStudySession` handles one module at a time — no cross-module sessions
- `calculateDailyPlan` returns at most 1 new module per day
- Exercise types: multiple choice, typing, gap fill, sentence order, reading comprehension
- No furigana in content data, no image exercises

**Key files**:
- `packages/types/src/module.ts:60-73` — Module + ContentItem types
- `packages/types/src/exercise.ts:4-33` — Exercise + ExerciseType
- `packages/engine/src/exercises.ts` — all exercise generators
- `packages/engine/src/daily-plan.ts:51` — `calculateDailyPlan`
- `packages/content/src/index.ts:13-58` — content aggregation
- `apps/web/src/hooks/useStudySession.ts:27-66` — session hook
- `apps/web/src/components/exercise/ExerciseRenderer.tsx:161-203` — mode dispatch

## Desired End State

A user opens Keiro and sees a thematic path: "Self-Introduction" → "Family" → "Animals" → etc. They tap "Start" and get a dynamic 15-minute session:

1. **Warm-up**: 2-3 SRS review cards
2. **Learn**: 5 new vocab items via image exercises ("Which word is this?" + photo of a cat) and multiple choice
3. **Read**: A 2-sentence passage using those 5 words + prior knowledge, with furigana toggle
4. **Comprehend**: 2 questions about the passage
5. **Learn more**: 2 grammar points via sentence building (arrange tiles with furigana)
6. **Read again**: Another passage using the grammar just learned
7. **Cool-down**: "You can now read this!" — a full sentence displayed beautifully

All reading content is real Japanese from filtered Tatoeba sentences, with pre-computed furigana.

## Out of Scope

- Manga panel licensing / in-app manga
- LLM-generated content
- User-generated content / community features
- Audio for reading passages
- Handwriting recognition
- Tap-to-reveal dictionary
- Full curriculum restructuring for all levels (pilot topic only for v1)

## Implementation Phases

### Phase 1: Content Build Pipeline

**Goal**: Automated scripts that fetch, filter, and process external data sources into Keiro's JSON format.

#### 1.1 — Tatoeba sentence fetcher + filter
- Download `tatoeba-json` repo (pre-processed JP-EN pairs)
- Filter pipeline: author fluency ≥3, exclude Tanaka Corpus bulk, direct translations only
- Tag each sentence with required vocab (tokenize with kuromoji, match against JLPT word lists)
- Output: `scripts/build-content/output/sentences-filtered.json` — array of `{ japanese, english, tokens[], jlptLevel, requiredVocab[] }`

#### 1.2 — JLPT vocabulary enrichment
- Download `Bluskyo/JLPT_Vocabulary` JSON files (N5-N3)
- Download `jmdict-simplified` common-only JSON
- Merge: for each Keiro vocab item, find the JMDict entry and attach frequency markers + example sentences from Tatoeba (where sentence contains that word)
- Output: enriched vocab JSON files with `examples: { japanese, english, furigana }[]` per item

#### 1.3 — Furigana annotator
- Install `kuroshiro` + `@sglkc/kuromoji` as devDependencies in a new `scripts/build-content/` workspace
- Script that takes any Japanese string → returns `FuriganaToken[]` where each token is `{ text: string, reading: string | null }`
- Process ALL existing reading passages + ALL filtered Tatoeba sentences
- Output: furigana-annotated versions stored alongside original text

#### 1.4 — Image sourcer (concrete nouns only)
- For the pilot topic: manually curate ~20-30 CC0 images from Wikimedia Commons
- Store as optimized WebP in `packages/content/images/`
- Map: `{ vocabWord: string, imageFile: string }` lookup table
- Full automation (API-based sourcing) deferred to scaling phase

### Phase 2: Thematic Module Structure

**Goal**: A new "Self-Introduction" (自己紹介) thematic unit that bundles vocab + grammar + reading in one coherent topic.

#### 2.1 — New types
- Add `ThematicModule` type extending `Module` with `theme: string` field
- Add `SentenceItem` type: `{ japanese: string, english: string, furigana: FuriganaToken[], requiredVocab: string[], requiredGrammar: string[] }`
- Add `FuriganaToken` type: `{ text: string, reading: string | null }`
- Add `imageUrl?: string` field to `VocabItem`
- Add `'sentence' | 'image-vocab'` to `ExerciseType` union
- Add `imageUrl?: string` and `furiganaTokens?: FuriganaToken[]` to `Exercise` interface

#### 2.2 — Pilot thematic content
- Create `packages/content/themes/self-introduction.json`:
  - 15-20 vocab items (私, 名前, 学生, 先生, 仕事, 趣味, 好き, etc.) — drawn from existing N5 vocab, retagged with theme
  - 3-5 grammar points (XはYです, XのY, 好きです/嫌いです) — drawn from existing N5 grammar
  - 10-15 Tatoeba sentences filtered for this topic's vocab/grammar
  - 2-3 original reading passages (checkpoint style)
  - Image references for concrete nouns (学生, 先生, etc.)

#### 2.3 — Content index update
- Import thematic module in `packages/content/src/index.ts`
- Thematic modules get `order` values that interleave with existing path (e.g., after kana modules)

### Phase 3: Engine — i+1 Selector + Dynamic Session Planner

**Goal**: Engine functions that assemble a dynamic, mixed-content session from a thematic module.

#### 3.1 — i+1 sentence selector
- New file: `packages/engine/src/i-plus-one.ts`
- `selectIPlusOneSentence(knownVocab: Set<string>, knownGrammar: Set<string>, sentencePool: SentenceItem[]): SentenceItem | null`
- Scores each sentence: all tokens known except exactly one = perfect i+1. Ranked by closeness to i+1.
- Falls back to i+0 (all known — reinforcement) if no i+1 available

#### 3.2 — Dynamic session planner
- New file: `packages/engine/src/session-planner.ts`
- `planDynamicSession(config: SessionConfig): SessionPlan`
- Input: thematic module, user's known vocab/grammar (from progress), SRS due cards, plan size
- Output: ordered list of `SessionStep[]` where each step is `{ type: 'learn' | 'read' | 'comprehend' | 'review' | 'cooldown', exercises: Exercise[] }`
- Implements the loop: warm-up → learn → read → comprehend → repeat → cool-down
- Replaces `calculateDailyPlan` for thematic modules (existing plan still works for legacy modules)

#### 3.3 — New exercise generators
- `generateImageExercise(vocabItem, allVocabItems)`: shows image, 4 text options
- `generateSentenceReadingExercise(sentence, comprehensionQuestions)`: shows sentence with furigana toggle, then comprehension MC
- Extend `generateGrammarExercises` to produce more sentence-building (arrange tiles) exercises

### Phase 4: UI Components

**Goal**: New components for the reading-first experience.

#### 4.1 — FuriganaText component
- New: `apps/web/src/components/reading/FuriganaText.tsx`
- Takes `tokens: FuriganaToken[]` and `showFurigana: boolean`
- Renders `<ruby>漢字<rt>かんじ</rt></ruby>` when furigana is on, plain text when off
- Uses the user's furigana toggle from `useSettings`

#### 4.2 — ReadingCard component
- New: `apps/web/src/components/reading/ReadingCard.tsx`
- Displays a sentence/passage with FuriganaText
- Shows English translation below (collapsible)
- Used in the "Read" step of the session loop and the "Cool-down" moment

#### 4.3 — ImageExercise component
- New: `apps/web/src/components/exercise/ImageExercise.tsx`
- Shows image + 4 text options (kanji/kana + reading)
- Reuses `AnswerOptions` for the selection UI
- New mode `'image'` in `exerciseMode.ts`
- New render branch in `ExerciseRenderer.tsx`

#### 4.4 — Dynamic session UI
- Modify `useStudySession` to accept a `SessionPlan` (from the dynamic planner) instead of a single `moduleId`
- Session progresses through `SessionStep[]` — each step renders different exercise types
- Between steps, show transition screens: "Now let's read!" / "You can now read this!"
- Progress indicator shows session phase, not just exercise count

#### 4.5 — "You Can Read This!" moment
- New: `apps/web/src/components/reading/ReadingMoment.tsx`
- Full-screen celebratory display of a Japanese sentence the user can now read
- FuriganaText with large serif font
- English translation revealed on tap
- Used as the cool-down step in every session

### Phase 5: Integration + Migration

**Goal**: Wire everything together, handle existing users, QA.

#### 5.1 — Home page integration
- If user has thematic modules available, show the thematic session CTA
- Legacy path (non-thematic modules) continues to work unchanged
- "Start Daily Study" button uses the dynamic planner for thematic modules

#### 5.2 — Path page update
- Thematic modules appear in the path with theme icons
- Existing JLPT modules remain accessible below

#### 5.3 — Progress migration
- Existing users keep their progress on legacy modules
- Thematic modules start fresh (no mapping needed — new content)
- SRS cards from legacy vocab carry over (same underlying items)

#### 5.4 — Scaling preparation
- Document the "add a new theme" process
- Create a template for thematic module JSON
- List the next 5 themes to build after pilot

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│  Build Pipeline (scripts/build-content/)         │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Tatoeba  │ │ JMDict   │ │ Furigana        │  │
│  │ Fetcher  │ │ Enricher │ │ Annotator       │  │
│  └────┬─────┘ └────┬─────┘ └───────┬─────────┘  │
│       └──────┬─────┘               │             │
│              ▼                     │             │
│  ┌───────────────────┐             │             │
│  │ Thematic Module   │◄────────────┘             │
│  │ Generator         │                           │
│  └─────────┬─────────┘                           │
└────────────┼─────────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────────┐
│  packages/content/themes/*.json                  │
│  (thematic modules with furigana + sentences)    │
└─────────────┬───────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────┐
│  packages/engine/                                │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ i-plus-one   │  │ session-planner        │   │
│  │ selector     │  │ (warm→learn→read→cool) │   │
│  └──────┬───────┘  └──────────┬─────────────┘   │
│         └────────┬────────────┘                  │
└──────────────────┼──────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────┐
│  apps/web/                                       │
│  ┌────────────┐ ┌───────────┐ ┌──────────────┐  │
│  │ FuriganaT. │ │ ImageExe. │ │ ReadingMom.  │  │
│  │ component  │ │ component │ │ component    │  │
│  └────────────┘ └───────────┘ └──────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ useStudySession (extended for SessionPlan) │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Testing Strategy

### Phase 1 (Content Pipeline)
- Unit tests for Tatoeba filter logic (mock TSV data, verify filtering rules)
- Unit tests for furigana annotator (known inputs → expected token outputs)
- Snapshot tests for generated thematic JSON (structure validation)

### Phase 3 (Engine)
- Unit tests for i+1 selector (known vocab set + sentence pool → correct selection)
- Unit tests for session planner (config → expected step sequence)
- Edge cases: empty sentence pool, all vocab known, zero SRS cards

### Phase 4 (UI)
- Component tests for FuriganaText (renders ruby tags, respects toggle)
- Component tests for ImageExercise (renders image, handles selection)
- Integration test: full session loop renders all step types

## Critical Files for Implementation

1. `packages/types/src/module.ts` — Add FuriganaToken, SentenceItem, imageUrl to VocabItem, theme field
2. `packages/types/src/exercise.ts` — Add image-vocab and sentence exercise types, imageUrl field
3. `packages/engine/src/exercises.ts` — Add image and sentence-reading generators
4. `packages/engine/src/daily-plan.ts` — Extension point for dynamic planner
5. `apps/web/src/hooks/useStudySession.ts:64` — Replace exercise assembly for thematic sessions
6. `apps/web/src/components/exercise/ExerciseRenderer.tsx:161-203` — Add new mode branches
7. `packages/content/src/index.ts:43-58` — Import thematic content alongside existing modules
