# Scope: Reading-First Keiro

## The Problem

Keiro currently teaches Japanese through isolated quiz-based modules (kana → vocab → kanji → grammar → reading), mirroring Duolingo's approach. Reading only appears at the end of each level as a separate section. This makes the "zero to reading manga" promise a tagline, not an experience. Users who want to read Japanese never feel like they're reading — they feel like they're doing flashcards.

**Pain**: The #1 complaint about Duolingo for Japanese is "I spent 1000 days and still can't read anything." Keiro risks the same fate. The structured path exists but doesn't culminate in the actual skill users want: reading comprehension.

**Impact**: This is the core product differentiation. Without it, Keiro is "minimalist Duolingo." With it, Keiro is "the Kindle for learning Japanese" — the only app where you're reading real Japanese from day one.

## Target Users

**Primary**: Self-taught learners who want to read manga, visual novels, or light novels in Japanese. They're frustrated with apps that teach individual words/grammar but never connect them to real reading. Age 18-35, likely anime/manga fans.

**Secondary**: JLPT N5-N3 students who need structured reading practice alongside their grammar/vocab study. They use Anki for SRS but lack a cohesive reading path.

**Needs**: "Take me from zero to reading Yotsuba&! at 80% comprehension in the most efficient, no-nonsense way possible."

## Success Criteria

- A user who completes the full path can read Yotsuba&! (JLPT ~N3) with ~80% comprehension without constantly reaching for a dictionary
- Users are reading real Japanese sentences from their first session (even if it's just あい = love after learning 5 hiragana)
- Every study session contains a reading moment — there is no session that's "just quizzes"
- The Learn → Practice → Read → Comprehend loop feels natural, not forced

## User Experience

### The Core Loop (per session, ~15 min)

1. **Warm-up** (2 min): 2-3 SRS review items from previous sessions
2. **Learn** (4 min): 3-5 new items (vocab or grammar) via exercises
3. **Read** (4 min): i+1 passage built from what you just learned + prior knowledge
4. **Comprehend** (2 min): 2-3 questions on the passage
5. **Repeat** steps 2-4 with a different content type
6. **Cool-down** (1 min): "You can now read this!" moment — a real sentence or mini-passage that uses everything learned today

### Adaptive Behavior

- Session structure adapts to user's current level and performance
- At beginner level: "passages" are single sentences (「あいはいえにいる。」)
- At N5: short paragraphs (2-3 sentences)
- At N3: full passages (5+ sentences)
- Content type mixing is dynamic — not rigid blocks of "all vocab then all grammar"
- i+1 principle: every reading contains exactly one new element beyond what the user knows

### Reading UX

- Furigana toggle: user controls whether reading hints appear above kanji
- Tap-to-reveal: tap an unknown word to see meaning (future consideration)
- Existing 40 reading passages serve as "level checkpoint" milestones — celebratory moments at the end of each JLPT level

### Thematic Curriculum

Instead of organizing by abstract JLPT content type (all vocab → all kanji → all grammar), the path is organized by **real-life topics**: Self-introduction, Family, Animals, Food, Daily routine, School, Shopping, Travel, etc. Each topic teaches the vocab, kanji, and grammar needed for that context — then the user reads a passage about that topic. This mirrors how language is actually used: you learn "dog, cat, panda" together because they belong to the same world, not because they're all N5 vocab items #47-49.

The JLPT levels still exist as progression markers (Beginner → N5 → N4 → N3), but within each level the content is grouped thematically.

### Exercise Types

**Image-based exercises**: For concrete nouns (animals, food, objects, places), show a photo and ask "Which word is this?" with kanji/kana options. Visual-linguistic association strengthens retention. Images sourced from royalty-free/CC0 sources (Unsplash, Pexels) or simple SVG illustrations.

**Sentence building**: "Arrange the words to form this sentence" — given a meaning in English, arrange Japanese word tiles into the correct order. Tiles show the word with furigana. Tests grammar structure understanding, not just recognition. Already partially implemented as `SentenceOrder` component.

**Existing types retained**: Multiple choice, typing input, gap fill, audio recognition — these serve the Learn phase of the loop.

## Scope Boundaries

### IN (v1)

- **Sentence bank from Tatoeba**: filtered for quality (author fluency 4-5 stars, "OK" tagged, direct translations only, exclude Tanaka Corpus derivatives)
- **EDRDG datasets**: JMDict for vocab definitions/examples, KanjiDic for kanji data — replacing or augmenting current open-anki-jlpt-decks
- **Pre-computed furigana**: morphological analyzer (kuromoji/mecab) at build time, stored in JSON
- **i+1 passage generator**: engine that assembles sentences from the user's known vocab/grammar pool + one new element
- **Dynamic session structure**: the warm-up → learn → read → comprehend → repeat → cool-down loop
- **"You can now read this!" moments** after every micro-lesson
- **Level checkpoint readings**: existing 40 passages as milestone content
- **Thematic curriculum**: reorganize content by real-life topics within each JLPT level
- **Image-based vocab exercises**: photo/illustration + kanji/kana matching for concrete nouns
- **Sentence building exercises**: arrange word tiles with furigana into correct Japanese word order

### OUT (v1)

- Manga panels or licensed content in-app
- LLM-generated sentences (reliability concern)
- User-generated content
- Community features
- Audio for reading passages
- Handwriting recognition
- Tap-to-reveal dictionary (future)
- Any feature not directly serving "sub-N5 → N3 reading ability"

### FUTURE (post v1)

- Tap-to-reveal inline dictionary during reading
- Manga panel exercises with real licensed content
- User reading history / "books read" tracker
- Reading speed metrics
- Community-curated reading content

## Constraints

- **Content licensing**: Tatoeba is CC BY 2.0 (requires attribution). JMDict/KanjiDic are CC BY-SA 4.0 (ShareAlike — derivative works must also be CC BY-SA). Current KANJIDIC2 usage needs legal review for closed-source commercial app. Mitigation: keep attribution visible, consider open-sourcing the content package separately.
- **Tatoeba quality**: Only ~1.6% of JP-EN pairs have verified fluent author+translator. Must filter aggressively: author fluency 4-5★, "OK" tag, direct translation, exclude Tanaka Corpus bulk imports.
- **Content volume**: Need thousands of quality-filtered sentences tagged by JLPT level and required vocab/grammar. This is a build-time pipeline, not runtime.
- **Furigana accuracy**: Morphological analyzers have ~95-98% accuracy on Japanese text. Edge cases: proper nouns, rare readings, 当て字. Acceptable for MVP; can manually correct flagged items later.
- **Bundle size**: Pre-computed furigana adds data to JSON files. Estimate +30-50% on reading content size. Acceptable given current chunked loading.
- **Offline-first**: All content must work offline. No runtime API calls for content. Everything baked into the build.

## Integration Points

- **packages/content/**: All new sentence data, furigana annotations, and curriculum reordering happens here
- **packages/engine/**: New i+1 passage assembly logic, dynamic session planner
- **packages/types/**: New types for annotated sentences, reading passages with furigana, session plan structure
- **apps/web/src/hooks/**: New `useReadingSession` hook or extension of `useStudySession`
- **apps/web/src/components/**: New reading components (passage display with furigana, comprehension questions)
- **Build pipeline**: New scripts to fetch/filter Tatoeba, process EDRDG data, compute furigana

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sentence source | Filtered Tatoeba + EDRDG | No LLM — reliability concern. Tatoeba is large but needs aggressive filtering. EDRDG is the gold standard for JP dictionaries. |
| Furigana | Pre-computed at build time | Keeps client lightweight. ~95-98% accuracy acceptable for MVP. |
| Session structure | Adaptive mixed loop | Rigid blocks kill attention. Dynamic mixing keeps engagement. |
| Existing passages | Keep as checkpoints | Well-written, properly leveled. Don't throw away good content. |
| Content ordering | Reorder for reading frequency | Counters/suffixes at lesson 1 don't serve reading. High-frequency words first. |
| Curriculum structure | Thematic (topics) not typological (all vocab then all kanji) | Mirrors real language use. "Animals" teaches dog/cat/panda + related kanji + grammar together. Keeps context and motivation. |
| Image exercises | Royalty-free photos for concrete nouns | Visual-linguistic pairing strengthens retention. Only for concrete nouns where images add value (not abstract grammar). |
| Sentence building | Extend existing SentenceOrder component | Already partially built. Add furigana on tiles, expand to more exercise contexts. |

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tatoeba filtering yields too few usable sentences per level | Core feature blocked | Supplement with grammar example sentences (392 existing). Expand filter criteria if needed. Measure count after first filter pass. |
| Furigana errors on edge cases | User sees wrong readings | Manual review process for flagged items. User report mechanism. |
| i+1 algorithm produces awkward/unnatural passages | Bad reading experience | Use real Tatoeba sentences, not programmatically assembled fragments. i+1 means selecting the right existing sentence, not generating new text. |
| CC BY-SA license on EDRDG data | Legal risk for commercial use | Open-source the content package. Or use JMDict data only for build-time processing (not shipped in the app binary). |
| Curriculum reorder breaks existing users' progress | Data migration needed | Map old module IDs to new ones. Preserve completion status. |
| Thematic reorganization is a massive content restructuring | Delays launch | Phase it: start with beginner topics, expand per level. Existing JLPT-ordered content works as fallback. |
| Image sourcing for 500+ concrete nouns | Time-consuming | Use Unsplash/Pexels API or curated CC0 sets. Start with high-frequency nouns only (animals, food, body, household). |

## Next Steps

This is a **Large** scope feature. Recommended approach:

1. `/spectre:plan` — Create implementation plan with phased delivery
2. **Phase 1**: Build-time content pipeline (Tatoeba fetch/filter, EDRDG integration, furigana computation, image sourcing for concrete nouns)
3. **Phase 2**: Thematic curriculum restructuring (reorganize modules by topic, map content to themes)
4. **Phase 3**: Engine changes (i+1 sentence selector, dynamic session planner, image exercise generator)
5. **Phase 4**: UI components (reading display with furigana, image exercises, enhanced sentence building, session loop, "you can read this!" moments)
6. **Phase 5**: Migration + polish (existing user progress migration, level checkpoints, QA)
