# Adding a New Theme to Keiro

## Steps

1. **Choose a topic**: Pick a real-life topic (e.g., Animals, Family, Food)

2. **Create the JSON file**: `packages/content/themes/{topic-name}.json`
   - Follow the structure in `self-introduction.json`
   - Include: vocab (15-20 items), grammar (3-5 points), sentences (10-15 with furigana), readings (2-3 checkpoints)

3. **Furigana**: For each Japanese sentence, create FuriganaToken[] arrays
   - Use the furigana annotator: `cd scripts/build-content && npx tsx src/furigana.ts`
   - Or manually construct tokens: `{ text: "漢字", reading: "かんじ" }` for kanji, `{ text: "は", reading: null }` for kana

4. **Import in content index**: Add import + spread in `packages/content/src/index.ts`
   - Set `order` to place the theme appropriately in the curriculum

5. **Images** (optional): Add CC0 images to `packages/content/images/` for concrete nouns

6. **Test**: Run `pnpm --filter @keiro/web exec tsc --noEmit` and `pnpm --filter @keiro/web test`

## Recommended Next Themes
1. 家族 (Family) — family members, relationships, home
2. 動物 (Animals) — pets, zoo animals, nature
3. 食べ物 (Food) — meals, restaurants, cooking
4. 日課 (Daily Routine) — time, activities, schedule
5. 学校 (School) — subjects, classroom, education

## Content Quality Checklist
- [ ] All vocab items have reading and meaning
- [ ] Grammar points have 2-3 example sentences with furigana
- [ ] Sentences progress from simple to complex
- [ ] Sentences use only vocab/grammar from this theme + prior themes
- [ ] Reading passages combine vocab and grammar naturally
- [ ] Comprehension questions are answerable from the passage text
