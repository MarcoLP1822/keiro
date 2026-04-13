# Task Context: Reading-First Keiro

## Scope Reference
See `concepts/scope.md` for full scope, boundaries, decisions, and risks.

## Architecture Patterns

### Content Pipeline
- All content lives as static JSON in `packages/content/`, imported via ES import assertions at build time by Vite
- No build step for content — JSON files are the authoritative source, tree-shaken by Vite
- Module type discriminates item shape: `KanaItem | VocabItem | GrammarItem | KanjiItem | ReadingItem`
- Adding a new content type requires: new type in `packages/types/src/module.ts:62`, new JSON file, new import in `packages/content/src/index.ts`, new generator in `exercises.ts`, new case in `useStudySession.ts`
- Global curriculum order controlled by `module.order` field in JSON

### Exercise Generation
- Generators are pure functions: `Module → Exercise[]` in `packages/engine/src/exercises.ts`
- Single `Exercise` interface with conditionally populated fields (options, correctAnswer, scrambledWords, etc.)
- Mode dispatch in `ExerciseRenderer.tsx` via `getExerciseMode()` → render branch
- Adding image exercises: add `imageUrl` to Exercise type, new mode in `exerciseMode.ts`, new render branch

### Session Management
- `useStudySession` owns a single module's exercises. Takes `(moduleId, mode)`, returns `{ exercises, score, handleComplete }`
- `useDailyPlan` calls `calculateDailyPlan` which returns `PlannedSession` with `modules: string[]` (already plural)
- Dynamic session planner plugs in at `useDailyPlan.ts:39` — replace `calculateDailyPlan` call, same input/output shape
- Cross-module sessions: replace `setExercises(generated)` at `useStudySession.ts:64` with multi-module assembler

### Current Content Inventory
- 3,524 vocab items (word + reading + meaning, NO example sentences)
- 392 grammar example sentences (the only sentence pool)
- 40 reading passages (1-4 sentences each)
- 612 kanji, 92 kana
- Vocab has NO example sentences — critical gap for i+1

## Dependencies

### Tatoeba Corpus
- **Access**: Weekly TSV exports at `https://downloads.tatoeba.org/exports/`
- **Pre-processed JSON**: `tatoeba-json` GitHub repo — JP-EN pairs as JSON, weekly updates
- **Shortcut**: `manythings.org/anki/` has pre-filtered JP-EN pairs
- **Key files**: `sentences_detailed.csv`, `links.csv`, `user_languages.csv`, `tags.csv`
- **Quality filtering**: Join author skill_level (≥3 advanced/4 native), exclude Tanaka Corpus bulk, check tags
- **License**: CC BY 2.0 (commercial OK with attribution)
- Only ~1.6% of pairs have verified fluent author+translator

### JMDict (EDRDG)
- **Source**: `https://www.edrdg.org/pub/Nihongo/JMdict_e.gz` (XML)
- **Best npm tool**: `@scriptin/jmdict-simplified-loader` (MIT) — streaming JSON parser, weekly releases
- **Also**: `JMDict_Extended` repo has JLPT levels pre-merged
- **JLPT tags**: JMDict has NO JLPT field. Must layer from external source.
- **Frequency**: `ichi1`, `news1`, `spec1` priority tags indicate common words
- **License**: EDRDG License — free for non-commercial; commercial requires contacting EDRDG

### KanjiDic2
- **Source**: `https://www.edrdg.org/kanjidic/kanjidic2.xml.gz`
- **npm**: Same `@scriptin/jmdict-simplified-loader` covers it
- **JLPT tags**: Has `<jlpt>` field but OLD 4-level system (pre-2010). Mapping: old 4≈N5, old 3≈N4, old 2≈N2+N3
- **License**: CC BY-SA 4.0

### Furigana Generation
- **Recommended**: `kuroshiro` + `@sglkc/kuromoji` for Node.js build pipeline
- kuroshiro converts text to `<ruby>漢字<rt>かんじ</rt></ruby>` HTML
- IPAdic-based, ~95-98% accuracy
- Alternative: `@aiktb/kuromoji` (more modern fork)
- MeCab (native binary) is more accurate but not portable for build pipeline
- **Decision**: Pre-compute at build time, store annotated text in JSON

### JLPT Level Lists
- No official JLPT word lists exist
- Best source: Jonathan Waller's lists at `jlptstudy.net` (widely used, covers N5-N1)
- `JMDict_Extended` repo has these pre-merged into JMDict entries
- KanjiDic2 has kanji JLPT tags (old system, needs mapping)

### Images for Vocab
- **Unsplash API**: Free tier 50 req/hr, CC-like license (no attribution required for photos)
- **Pexels API**: Free, 200 req/hr, attribution required
- **Pixabay API**: Free, CC0, 100 req/min
- For build-time: download and bundle as optimized assets
- Start with high-frequency concrete nouns only (~200-300 images)

## Implementation Approaches

### Approach A: Content Pipeline First (Recommended)
Build the data foundation before touching the app:
1. Create build scripts that fetch/filter Tatoeba, parse JMDict/KanjiDic2
2. Generate annotated JSON (sentences with furigana, JLPT tags, vocab cross-references)
3. Restructure modules thematically
4. Then update engine + UI to consume the new content

**Pros**: Content quality is validated before any app changes. Can iterate on data without rewriting code.
**Cons**: No visible app changes for a while. Requires patience.

### Approach B: UI-First with Stub Content
Build the new session loop and reading UI first with placeholder content:
1. Create reading display component with furigana
2. Build dynamic session planner
3. Wire up the learn→read→comprehend loop
4. Backfill with real content later

**Pros**: Visible progress immediately. Can test UX with stub data.
**Cons**: Risk of building UI that doesn't match actual content shape. Double work.

### Approach C: Vertical Slice (Balanced)
Build one complete topic end-to-end:
1. Pick "Animals" as the pilot topic
2. Source ~50 filtered Tatoeba sentences about animals
3. Add furigana to those sentences
4. Create the thematic module structure for this one topic
5. Build the dynamic session loop for this one topic
6. Ship it as a proof of concept, then scale to all topics

**Pros**: Validates the full stack with minimal content. Fast feedback loop.
**Cons**: Pilot topic may not represent all edge cases.

## Impact Summary

### Files to Create (new)
- `scripts/build-content/` — Tatoeba fetcher, JMDict parser, KanjiDic parser, furigana annotator, image downloader
- `packages/content/sentences/` — filtered Tatoeba sentences per JLPT level
- `packages/content/themes/` — thematic module definitions
- `packages/engine/src/session-planner.ts` — dynamic session assembly
- `packages/engine/src/i-plus-one.ts` — sentence selector based on known vocab
- `apps/web/src/components/exercise/ImageExercise.tsx` — image-based exercise
- `apps/web/src/components/reading/ReadingDisplay.tsx` — passage with furigana toggle

### Files to Modify (existing)
- `packages/types/src/module.ts` — new item types, furigana fields, image fields
- `packages/types/src/exercise.ts` — new exercise types, imageUrl field
- `packages/engine/src/exercises.ts` — new generators for image + reading exercises
- `packages/engine/src/daily-plan.ts` — dynamic multi-module planning
- `packages/content/src/index.ts` — import new thematic content
- `apps/web/src/hooks/useStudySession.ts` — support dynamic multi-module sessions
- `apps/web/src/hooks/useDailyPlan.ts` — wire new session planner
- `apps/web/src/components/exercise/ExerciseRenderer.tsx` — new mode branches
- `apps/web/src/components/exercise/exerciseMode.ts` — new exercise modes
- `apps/web/src/pages/Home.tsx` — new session loop entry point

### External Research
- Tatoeba quality: only 1.6% of JP-EN pairs are fully verified. Aggressive filtering needed.
- EDRDG license: not OSI. Commercial use requires contacting EDRDG. Mitigation: open-source content package or use only for build-time processing.
- Furigana: kuroshiro + @sglkc/kuromoji is the best pure-JS build pipeline option. ~95-98% accuracy.
- JLPT levels: no official word lists. Jonathan Waller's lists are the de facto standard.

## Selected Approach: C — Vertical Slice

Build one complete topic ("Self-Introduction" or "Animals") end-to-end: content pipeline → thematic module → engine (i+1, dynamic session) → UI (reading with furigana, image exercises, session loop). Validate full stack, then scale to all topics.

## Complexity Assessment

| Signal | Assessment | Level |
|--------|-----------|-------|
| Files impacted | 15+ new files, 10+ modified | **High** |
| Pattern match | New patterns needed (content pipeline, sentence selector, dynamic planner) | **High** |
| Components crossed | content + engine + types + web hooks + web components + build scripts | **High** |
| Data model changes | New types, new content format, furigana annotations | **High** |
| Integration points | Tatoeba, JMDict, KanjiDic2, image APIs, kuromoji | **High** |
| External complexity | Multiple data sources with quality/licensing concerns | **High** |

**Hard-stops triggered**: new_service_or_component (content pipeline, session planner)

**Tier: COMPREHENSIVE**
