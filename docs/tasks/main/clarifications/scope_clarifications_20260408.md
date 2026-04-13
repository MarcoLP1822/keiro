# Scope Clarifications: Reading-First Keiro

## Confirmed Boundaries

**IN:** Adaptive i+1 reading at every stage, procedurally generated sentences, mixed dynamic lessons, furigana toggle, retrofit existing content, success = read Yotsuba at 80%
**OUT:** Manga licensing, UGC, community, audio passages, handwriting, anything non-essential

---

## Open Questions

### Q1: Sentence generation strategy
We have 3,524 vocab items with ZERO example sentences and only 392 grammar sentences. For i+1 procedural generation, we need thousands of sentences. Options:
- (a) Use an LLM (Claude API) at build time to generate 5-10 example sentences per vocab item → bake into JSON (one-time cost, static)
- (b) Use an external sentence bank (Tatoeba — CC licensed, 200k+ Japanese sentences tagged by JLPT level)
- (c) Both: Tatoeba as base, LLM-augmented for gaps

Which approach? (a) gives full control but costs API credits. (b) is free and huge but variable quality. (c) is recommended.

<response>
per tatoeba leggi questo articolo, non usiamo llm perché può non essere reliable, usiamo tatoeba ma prima bisogna filtrare le frasi corrette: https://blog.kanjiverse.com/can-we-trust-tatoeba-sentences/
</response>

### Q2: Furigana data
Reading passages have no furigana. Options:
- (a) Pre-compute furigana at build time using a morphological analyzer (kuromoji/mecab) and store in the JSON
- (b) Compute furigana client-side at runtime (heavier bundle, ~300KB for tokenizer)
- (c) Manually annotate (impractical at scale)

Recommendation: (a) — pre-compute and store. Keeps the client lightweight.

<response>
mi fido di te quindi soluzione A
</response>

### Q3: Dynamic session structure
"Mixed/dynamic" means the lesson flow adapts. Concrete proposal for a session:
1. Quick warm-up: 2-3 SRS review items
2. Learn: 3-5 new items (vocab or grammar) via exercises
3. Read: i+1 passage using what you just learned + prior knowledge
4. Comprehend: 2-3 questions on the passage
5. Repeat steps 2-4 with different content type
6. Cool-down: 1 "you can now read this!" moment showing a real sentence/mini-passage

Total session: ~15 min. Does this loop feel right?

<response>
yes it's perfect
</response>

### Q4: Existing reading passages retrofit
The 40 existing passages (N5/N4/N3) are usable as-is for comprehension at the end of each level. But they don't fit the new i+1 model (they use arbitrary vocab, not specifically what the user just learned). Options:
- (a) Keep them as "level checkpoint" readings (milestone moments)
- (b) Break them into smaller pieces and tag each sentence with required vocab/grammar
- (c) Replace entirely with generated content

Recommendation: (a) — use as checkpoints. They're well-written and properly leveled. Generate new i+1 content for the learn-read loop.

<response>
ok for (a)
</response>

### Q5: Content quality bar
You said "best in class resources." Current sources are MIT/CC licensed open datasets. For a reading-first app, content quality is everything. Should we:
- (a) Stick with current data, augment with generated sentences
- (b) Audit and replace weak content (e.g., the first 2 N5 vocab modules are counters/suffixes, not useful for beginner reading)
- (c) Reorder the curriculum to prioritize "high-frequency reading words" first (e.g., the 500 most common words in manga)

<response>
we partially answered to this in the previous questions, i'd say we filter tatoeba like i said in question 1, use the edrdg datasets like jmdict, kanjidict.
</response>
