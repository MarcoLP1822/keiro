# Keiro (経路) — Learn Japanese

> **In breve.** Un'app per imparare il giapponese partendo da zero: lezioni in ordine dagli alfabeti (hiragana e katakana) fino al livello JLPT N3, frasi vere da leggere fin dall'inizio, ripasso automatico delle parole e funzionamento anche offline. Si installa sul telefono direttamente dal browser.
>
> **A che punto è:** completa e online. Ultimo lavoro: aprile 2026.
>
> **Online:** <https://keiro-web-smoky.vercel.app>

A structured, mobile-first PWA that takes you from zero Japanese to reading real sentences. 290+ learning modules covering kana, vocabulary, kanji, grammar, and reading comprehension from N5 to N3, plus thematic modules built around the reading-first approach.

**Live app**: [keiro-web-smoky.vercel.app](https://keiro-web-smoky.vercel.app/)

## Features

- **Structured i+1 curriculum** — Each lesson builds on the previous one. No random flashcards.
- **Kana → Thematic → N5 → N4 → N3** — Hiragana, katakana, real-world topics, then progressive JLPT levels
- **Reading-first sessions** — Thematic modules follow a warm→learn→read→comprehend→cooldown loop. You read real Japanese sentences early, not at the end.
- **"You can read this!" moments** — Each thematic session ends with a full sentence you have just learned to read
- **i+1 sentence selection** — The engine scores sentences by unknown vocabulary count and always picks the one with exactly one new word
- **Furigana toggle** — Ruby annotations above kanji, switchable at any time in settings
- **SM-2 spaced repetition** — Review cards at optimal intervals with auto-throttle to prevent pile-up
- **12+ exercise types** — Multiple choice, typing, gap fill, sentence ordering, image-vocab, sentence-reading, reading comprehension, audio
- **Placement quiz** — Skip ahead if you already know the basics
- **Offline-first** — All data stored locally in IndexedDB. Works without internet.
- **Cloud sync** — Optional sign-in to sync progress across devices via Supabase
- **Kana chart** — Interactive reference with tap-to-hear pronunciation
- **Digital Karesansui design** — Minimal, ink-on-stone aesthetic with dark mode support
- **PWA** — Installable on iOS and Android home screens

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 + pnpm workspaces |
| Styling | Tailwind CSS v4 |
| Local storage | Dexie.js (IndexedDB) |
| Cloud sync | Supabase (Auth + PostgreSQL) |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting | Vercel |

## Project Structure

```
keiro/
├── apps/
│   ├── web/          # User-facing PWA
│   └── admin/        # Content editor & admin dashboard (local dev tool)
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── engine/       # Core logic (SRS, exercises, scoring, streak, placement, i+1, session planner)
│   └── content/      # Learning content
│       ├── kana/     # Hiragana + katakana modules
│       ├── vocabulary/
│       ├── kanji/
│       ├── grammar/
│       ├── reading/  # JLPT reading passages
│       └── themes/   # Thematic modules (self-introduction, …)
├── scripts/
│   └── build-content/  # Content pipeline: Tatoeba filter, furigana annotator, JLPT data
├── supabase/         # Database schema and migrations
└── docs/             # Architecture, task specs, guides
```

### Clean Architecture

```
types (data contracts)
  ↑
engine (business logic) ← imports only types
  ↑
content (learning data) ← imports only types
  ↑
web / admin (presentation) ← imports all packages
```

## Reading-First Approach

Thematic modules replace the traditional vocabulary-dump-then-quiz flow with a session loop designed around reading:

1. **Review** — SRS cards due from previous sessions
2. **Learn** — 3–5 new vocab or grammar items
3. **Read** — One i+1 selected sentence with furigana toggle
4. **Comprehend** — 2 comprehension questions on the sentence
5. Repeat learn → read cycle for the remaining items
6. **"You can read this!"** — Cooldown with a complete sentence you can now read

Content is assembled at build time from filtered Tatoeba sentences, enriched with JLPT vocabulary data and pre-computed furigana tokens. The `scripts/build-content/` pipeline handles download, quality filtering, tokenization, and annotation — all offline-first.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install & Run

```bash
git clone https://github.com/MarcoLP1822/keiro.git
cd keiro
pnpm install
pnpm --filter @keiro/web dev
```

Open [http://localhost:5173](http://localhost:5173).

### Cloud Sync (optional)

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/schema.sql` in the SQL Editor
3. Create `apps/web/.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Redeploy or restart dev server

### Run Tests

```bash
pnpm --filter @keiro/engine test    # 143 engine tests
pnpm --filter @keiro/web test       # 46 web tests
pnpm --filter build-content test    # 14 build-content tests
```

200+ tests across all packages.

## Content

| Level | Vocab | Kanji | Grammar | Reading | Thematic | Total Modules |
|-------|-------|-------|---------|---------|----------|---------------|
| Kana | — | — | — | — | — | 20 |
| Thematic (N5) | — | — | — | — | 1 | 1 |
| N5 | 36 | 8 | 28 | 5 | — | 77 |
| N4 | 34 | 17 | 25 | 4 | — | 80 |
| N3 | 107 | 54 | 51 | 3 | — | 215 |

Content is sourced from open-licensed datasets (MIT, CC BY-SA 4.0, Tatoeba CC BY 2.0 FR). See the About page in the app for full attribution.

## License

All rights reserved.
