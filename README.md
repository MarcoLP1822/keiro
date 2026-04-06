# Keiro (経路) — Learn Japanese

A structured, mobile-first PWA that takes you from zero Japanese to reading manga. 351 learning modules covering kana, vocabulary, kanji, grammar, and reading comprehension from N5 to N3.

**Live app**: [keiro-web-smoky.vercel.app](https://keiro-web-smoky.vercel.app/)

## Features

- **Structured i+1 curriculum** — Each lesson builds on the previous one. No random flashcards.
- **Kana → N5 → N4 → N3** — Hiragana, katakana, then progressive JLPT levels
- **SM-2 spaced repetition** — Review cards at optimal intervals with auto-throttle to prevent pile-up
- **12+ exercise types** — Multiple choice, typing, gap fill, sentence ordering, reading comprehension, audio
- **Furigana support** — Ruby annotations above kanji, toggleable in settings
- **Placement quiz** — Skip ahead if you already know the basics
- **Offline-first** — All data stored locally in IndexedDB. Works without internet.
- **Cloud sync** — Optional sign-in to sync progress across devices via Supabase
- **Kana chart** — Interactive reference with tap-to-hear pronunciation
- **Apple HIG design** — Native iOS look and feel with dark mode support
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
│   ├── engine/       # Core logic (SRS, exercises, scoring, streak, placement)
│   └── content/      # Learning content (kana, vocab, kanji, grammar, reading)
├── supabase/         # Database schema and migrations
└── scripts/          # Utilities (icon generation)
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
pnpm --filter @keiro/engine test    # 114 engine tests
pnpm --filter @keiro/web test       # 41 web tests
```

## Content

| Level | Vocab | Kanji | Grammar | Reading | Total Modules |
|-------|-------|-------|---------|---------|---------------|
| Kana | — | — | — | — | 20 |
| N5 | 36 | 8 | 28 | 5 | 77 |
| N4 | 34 | 17 | 25 | 4 | 80 |
| N3 | 107 | 54 | 51 | 3 | 215 |

Content is sourced from open-licensed datasets (MIT, CC BY-SA 4.0). See the About page in the app for full attribution.

## License

All rights reserved.
