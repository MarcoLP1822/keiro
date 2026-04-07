# Review Analysis: Production Readiness Audit

**Date**: 2026-04-06 18:00
**Focus Area**: Full production readiness audit against 7 development principles
**Context**: Pre-launch final check for Keiro Japanese learning PWA

---

## Summary

The Keiro codebase is **well-architected and close to production-ready**. The clean architecture layering is solid, TypeScript strict mode is enabled, routes are lazy-loaded, and the Dexie schema has proper migrations. However, the audit found **3 critical issues**, **6 important issues**, and **9 minor issues** that should be addressed before public launch.

**Overall Grade: B+** -- A few targeted fixes bring this to A.

---

## A. DRY Violations

### FAIL -- `getExerciseMode` duplicated in two files

**Files:**
- `apps/web/src/components/exercise/ExerciseRenderer.tsx:26`
- `apps/web/src/pages/SrsReview.tsx:27`

Both files define an identical `getExerciseMode` function and `ExerciseMode` type. The ExerciseRenderer version includes `'reading'` as a mode; the SrsReview version does not (because SRS doesn't review reading modules). Despite the minor difference, the core switch logic is the same.

**Fix:** Extract `getExerciseMode` into the exercise barrel export (`components/exercise/index.ts`) and import it in both places. The SrsReview version can use the same function since reading exercises simply won't appear in SRS reviews.

### FAIL -- Sound+haptic feedback pattern duplicated 3 times

The pattern of checking `audio`, calling `playCorrectSound`/`playIncorrectSound`, and `vibrateSuccess`/`vibrateError` appears in:
- `ExerciseRenderer.tsx` (lines 66-72, 119-124, 130-135)
- `SrsReview.tsx` (lines 83-89, 94-98, 105-109, 117-120)

**Fix:** Extract a `playFeedback(isCorrect: boolean, audio: boolean)` helper in `services/sounds.ts` or a shared util.

### FAIL -- `createVocabWordToMeaning` in placement.ts duplicates `createVocabExercise` in exercises.ts

`packages/engine/src/placement.ts:57-72` duplicates the word-to-meaning exercise creation logic from `exercises.ts:139-189`. Similarly, `createGrammarPickCorrect` (placement.ts:74-94) duplicates the grammar exercise creation in `exercises.ts:419-453`.

**Fix:** Import and reuse the existing exercise generators from `exercises.ts` in the placement module.

### PASS -- Constants, types, and interfaces

No duplicated types or constants were found. The `PASS_THRESHOLD = 0.8` appears in both `scoring.ts` and `placement.ts`, but these are semantically different thresholds (module pass vs. placement stage pass), so this is acceptable. However, consider extracting to a shared constant for consistency.

---

## B. Clean Architecture Violations

### PASS -- packages/types has NO imports from engine, content, or web

Verified: `packages/types/src/*.ts` only imports from `./module.js` (internal). No external package imports.

### PASS -- packages/engine imports ONLY from types

Verified: All engine `src/*.ts` files import only from `@keiro/types`. The one exception is `placement.ts` importing from `./exercises.js` which is internal to engine -- that is correct.

### FAIL -- packages/engine depends on @keiro/content in package.json

`packages/engine/package.json:15` declares `"@keiro/content": "workspace:*"` as a dependency. However, no engine source file actually imports from `@keiro/content`. This is a stale dependency.

**Fix:** Remove `@keiro/content` from engine's `package.json` dependencies.

### PASS -- packages/content imports ONLY from types

Verified: `packages/content/src/index.ts` imports only from `@keiro/types`.

### PASS -- apps/web imports only from barrel exports

All imports use `@keiro/engine`, `@keiro/content`, `@keiro/types` -- never internal paths like `@keiro/engine/src/daily-plan`.

### PASS -- No cross-layer contamination in the admin app

Admin app imports Supabase client directly and has its own service layer, which is correct for an admin dashboard.

---

## C. Production Readiness Gaps

### PASS -- console.log/warn/error statements are appropriate

- `ErrorBoundary.tsx:24` -- `console.error` in componentDidCatch: **PASS** (Sentry integration would capture this; error is also displayed visually)
- `analytics.ts:6` -- `console.log` gated by `import.meta.env.DEV`: **PASS** (dev-only)
- `sync.ts:47,128,136,254` -- `console.warn`/`console.error` for sync issues: **PASS** (errors are also stored in `_lastError` and displayed in Settings UI)
- `Settings.tsx:103,123` -- `console.error` for export/delete failures: **PASS** (errors are also displayed via `actionError` state)
- `admin/content-writer.ts:55` -- `console.log` for dev server: **PASS** (server-side dev tool)

### PASS -- Error boundaries catch and display errors

`ErrorBoundary` wraps the entire app in `App.tsx:126`. It displays a user-friendly message and a "Go Home" button. Error is also logged to console for Sentry capture.

### PASS -- Loading states for async operations

- IndexedDB queries via `useLiveQuery` return `undefined` while loading, and all call sites handle this (e.g., `Home.tsx`, `Stats.tsx`, `LeechReview.tsx`)
- `LoadingSpinner` and `LoadingPage` are used consistently
- `Suspense` with `LoadingPage` fallback wraps all lazy-loaded routes
- `PrimaryButton` supports a `loading` prop with spinner

### PASS -- Empty states handled

- `Review.tsx:24-29` -- "Nothing to review yet" message
- `LeechReview.tsx:36-39` -- "No difficult items" message
- `Stats.tsx:165-170` -- "Complete modules to start tracking"
- `Stats.tsx:285-290` -- "No SRS cards yet"
- `Home.tsx:301-314` -- All-modules-complete state with congratulations message

### PASS -- PWA manifest validates

The manifest in `vite.config.ts` includes: name, short_name, description, display: standalone, start_url, theme_color, background_color, and 3 icon sizes (SVG any, 192px PNG, 512px PNG maskable). All referenced icon files exist in `public/`.

### PASS -- Meta tags present

`index.html` includes: description, og:type, og:url, og:title, og:description, og:image, twitter:card, twitter:title, twitter:description.

### PASS -- Security headers in vercel.json

X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, CSP with restrictive defaults.

### PASS -- Privacy policy exists and is linked

`Privacy.tsx` is a full privacy policy page linked from `About.tsx:134-147` and accessible at `/privacy`.

### PASS -- robots.txt exists

`public/robots.txt` exists with `User-agent: * / Allow: /`.

### PASS -- Code splitting with lazy routes

All 16 routes are lazy-loaded in `App.tsx:12-28` using `lazy()` + `Suspense`.

### PASS -- Manual chunk splitting configured

`vite.config.ts:44-56` splits vendor (React), supabase, and content by level into separate chunks.

---

## D. Error Handling (Fail Loud, Never Fake)

### PASS -- sync.ts push/pull try/catch (lines 52, 141)

Catches errors, stores them in `_lastError`, which is displayed in `Settings.tsx:171-173`. Also logs to console for Sentry.

### PASS -- Settings.tsx export try/catch (line 73)

Sets `actionError` state displayed in UI at `Settings.tsx:321-323`.

### PASS -- Settings.tsx delete account try/catch (line 113)

Sets `actionError` state displayed in the same UI error banner.

### FAIL (Important) -- sounds.ts try/catch silently swallows errors

`services/sounds.ts:24,42` -- `playCorrectSound` and `playIncorrectSound` catch errors with empty catch blocks:
```
catch {
    // Silently skip if audio fails
}
```

While audio is non-critical UX sugar and crashing on audio failure would be worse, the comments say "Silently skip" which violates the "Fail Loud" principle. At minimum, these should have a disclosed comment explaining the intentional suppression.

**Severity: Minor** -- The fallback is reasonable for non-critical audio, but per the project's own principle, this should be explicitly disclosed, not silently swallowed. The current comment is minimal but present.

### PASS -- ErrorBoundary componentDidCatch

Logs to console (Sentry) and renders error UI. Fully compliant.

### FAIL (Important) -- auth flow errors in App.tsx AuthHandler

`App.tsx:88,94` -- `supabase.auth.getSession().then(...)` has no `.catch()`. If Supabase is unreachable during initial load, this promise rejection is unhandled and the app will be stuck on `LoadingPage` forever.

**Fix:** Add `.catch()` that sets `authReady = true` and optionally logs the error. The app should still work in offline-first mode.

### FAIL (Important) -- useDailyPlan.markComplete has no error handling

`hooks/useDailyPlan.ts:52-64` -- `markComplete()` does `db.dailyPlan.put()` and `db.streakData.put()` without try/catch. If IndexedDB write fails, the error propagates unhandled.

**Fix:** Wrap in try/catch or handle at the call site.

---

## E. State of the Art

### PASS -- No deprecated APIs or patterns

- React 19 with functional components (the only class component is `ErrorBoundary`, which is correct -- error boundaries require class components)
- `react-router` v7 (current)
- Vite 6 with modern plugins
- `import ... with { type: 'json' }` (modern JSON import assertions)
- TypeScript `strict: true`

### PASS -- No `any` types

Zero occurrences of `: any` or `as any` in the entire codebase.

### PASS -- TypeScript strict mode enabled

`tsconfig.base.json` has `"strict": true` plus `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.

### PASS -- Modern React patterns

All hooks follow rules-of-hooks. `useCallback` used correctly for stable references. `useMemo` for expensive computations. No misuse of `useEffect`.

### MINOR -- `as unknown as Record<string, unknown>` cast

`hooks/useReviewSession.ts:78` uses `ex.targetItem as unknown as Record<string, unknown>` which is a type escape hatch. This works but is fragile.

**Fix:** Consider a type guard or discriminated union on `ContentItem` to make this type-safe.

---

## F. Backward Compatibility

### PASS -- Dexie schema migrations are properly versioned

Five versions (v1 through v5) with proper `.upgrade()` functions:
- v3: Adds `updatedAt` and `userId` to all tables
- v5: Adds `lapseCount` and `isLeech` with defaults for existing cards

Existing users upgrading from any version will get proper migrations.

### PASS -- Supabase schema has CASCADE constraints

All tables reference `auth.users(id) ON DELETE CASCADE`. Account deletion will properly clean up all data.

### FAIL (Critical) -- Supabase schema missing `lapse_count` and `is_leech` columns

The `srs_cards` table in `supabase/schema.sql` does **not** define `lapse_count` or `is_leech` columns. However, `sync.ts:89-90` pushes these values:
```
lapse_count: c.lapseCount ?? 0,
is_leech: c.isLeech ?? false,
```

This means:
1. Cloud sync of leech data will silently fail or be ignored by Supabase
2. Data pulled from cloud will not contain leech information

**Fix:** Add to `supabase/schema.sql`:
```sql
ALTER TABLE srs_cards ADD COLUMN lapse_count INTEGER DEFAULT 0;
ALTER TABLE srs_cards ADD COLUMN is_leech BOOLEAN DEFAULT FALSE;
```

### PASS -- LocalStorage/IndexedDB backward compatibility

The app uses Dexie's versioned schema with upgrade paths. No raw localStorage usage (auth state is managed by Supabase client internally).

---

## G. Security

### PASS -- No secrets in client-side code

Supabase URL and anon key are loaded from `import.meta.env.VITE_*` environment variables. Sentry DSN is loaded from `VITE_SENTRY_DSN`. No hardcoded secrets found.

### PASS -- No XSS vulnerabilities

Zero uses of `dangerouslySetInnerHTML`. All user-visible text is rendered through React's auto-escaping JSX. The only user input is email/password and typing exercise answers, all handled safely.

### PASS -- Auth flow security

- Password minimum length enforced client-side: `password.length < 6` (Login.tsx:104, ResetPassword.tsx:78)
- Supabase enforces password requirements server-side
- `autoComplete` attributes properly set (`email`, `current-password`, `new-password`)
- Password reset flow uses Supabase's built-in email verification

### PASS -- CSP properly configured

`vercel.json` CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; font-src 'self'`

This is restrictive and appropriate. `'unsafe-inline'` for styles is needed for Tailwind's runtime styles.

### PASS -- RLS (Row Level Security) on all Supabase tables

Every table has RLS enabled with policies restricting access to `auth.uid() = user_id`.

### PASS -- Account deletion via SECURITY DEFINER function

`delete_own_account()` is properly scoped with `SET search_path = public` and only allows deleting the calling user's own account.

---

## H. Test Coverage Gaps

### Engine tests: GOOD coverage

| File | Test File | Status |
|------|-----------|--------|
| exercises.ts | exercises.test.ts, exercises-grammar.test.ts, exercises-kanji.test.ts, exercises-reading.test.ts, exercises-vocab.test.ts | PASS |
| scoring.ts | scoring.test.ts | PASS |
| daily-plan.ts | daily-plan.test.ts | PASS |
| srs.ts | srs.test.ts | PASS |
| streak.ts | streak.test.ts | PASS |
| placement.ts | placement.test.ts | PASS |

### Web component tests: PARTIAL coverage

| Component | Test | Status |
|-----------|------|--------|
| Modal | Modal.test.tsx | PASS |
| PrimaryButton | PrimaryButton.test.tsx | PASS |
| ProgressBar | ProgressBar.test.tsx | PASS |
| SegmentedControl | SegmentedControl.test.tsx | PASS |
| AnswerOptions | AnswerOptions.test.tsx | PASS |
| FeedbackBar | FeedbackBar.test.tsx | PASS |
| QuestionDisplay | QuestionDisplay.test.tsx | PASS |
| ModuleCard | ModuleCard.test.tsx | PASS |
| audio service | audio.test.ts | PASS |
| sounds service | sounds.test.ts | PASS |

### FAIL (Important) -- Critical paths with NO tests

The following critical user flows have zero unit/integration tests:

1. **`useStudySession` hook** -- Generates exercises from modules. Core learning flow.
2. **`useReviewSession` hook** -- Loads SRS cards and generates review exercises.
3. **`useDailyPlan` hook** -- Calculates and manages the daily study plan.
4. **`storage.ts` service** -- All database operations. No mock tests.
5. **`sync.ts` service** -- Cloud sync push/pull. No tests at all.
6. **`useAuth` hook** -- Authentication flow.
7. **`ExerciseRenderer` component** -- The main exercise interaction orchestrator.
8. **PlacementQuiz flow** -- End-to-end placement evaluation.

### E2E tests: PRESENT but limited

4 E2E specs exist (first-launch, module-completion, settings-reset, study-session) which cover the happy paths.

---

## Critical Issues (Must Fix Before Launch)

### 1. CRITICAL -- Supabase schema missing leech columns
**File:** `supabase/schema.sql`
**Impact:** Cloud sync silently drops leech data. Users who rely on sync between devices will lose leech tracking.
**Fix:** Add `lapse_count INTEGER DEFAULT 0` and `is_leech BOOLEAN DEFAULT FALSE` to the `srs_cards` table.

### 2. CRITICAL -- Unhandled promise rejection in AuthHandler
**File:** `apps/web/src/App.tsx:88,94`
**Impact:** If Supabase is unreachable during app load, the app shows an infinite loading screen with no way to proceed.
**Fix:** Add `.catch(() => setAuthReady(true))` to both `getSession()` calls.

### 3. CRITICAL -- `getLeechCards` exported from engine but NOT re-exported from barrel
**File:** `packages/engine/src/index.ts`
**Impact:** The function exists in `srs.ts:87` and has tests, but is not accessible to consumers via `@keiro/engine`. It's dead code from the barrel's perspective. The web app works around this by querying Dexie directly (`db.srsCards.where('isLeech').equals(1)`), duplicating logic.
**Fix:** Add `getLeechCards` to `packages/engine/src/index.ts` exports.

---

## Important Issues

### 4. `getExerciseMode` duplicated -- DRY violation
**Files:** `ExerciseRenderer.tsx:26`, `SrsReview.tsx:27`
**Fix:** Extract to shared module.

### 5. Sound/haptic feedback boilerplate repeated
**Files:** `ExerciseRenderer.tsx`, `SrsReview.tsx` (6+ call sites)
**Fix:** Extract `playFeedback(isCorrect, audioEnabled)` helper.

### 6. Placement exercise generators duplicate engine logic
**Files:** `packages/engine/src/placement.ts:57-94`
**Fix:** Reuse `createVocabExercise` and grammar generation from `exercises.ts`.

### 7. Stale dependency in engine package.json
**File:** `packages/engine/package.json:15`
**Fix:** Remove `"@keiro/content": "workspace:*"`.

### 8. `useDailyPlan.markComplete` lacks error handling
**File:** `hooks/useDailyPlan.ts:52-64`
**Fix:** Wrap in try/catch, surface errors to caller.

### 9. No tests for sync, storage, or core hooks
**Impact:** Regressions in these areas would go undetected.
**Fix:** Add tests for `sync.ts`, `storage.ts`, `useStudySession`, and `useDailyPlan` at minimum.

---

## Minor Issues

### 10. `PASS_THRESHOLD` defined in both scoring.ts and placement.ts
Both use `0.8` but for different purposes. Low risk but could drift.

### 11. `as unknown as Record<string, unknown>` type escape in useReviewSession.ts:78
Should use proper discriminated union checks.

### 12. `sounds.ts` empty catch blocks
Intentional but violates "Fail Loud" principle in letter. Add explicit `// Intentional: non-critical audio failure` comments or log to Sentry at `info` level.

### 13. `PlacementQuiz.tsx:66` returns `null` while exercises load
Should show a loading spinner instead of blank screen.

### 14. `useStreak.lastResult` is hardcoded to `null`
`hooks/useStreak.ts:18` -- `lastResult: null as { freezeUsed: boolean; freezeEarned: boolean } | null`. This means the streak notification in `Home.tsx:351-358` (`lastResult?.freezeEarned`) will never trigger.

### 15. `Link` imported but used inconsistently
`About.tsx` imports `Link` from `react-router` for the privacy link, but most navigation uses `navigate()`. Pick one pattern.

### 16. Missing `Sitemap.xml` for SEO
`robots.txt` exists but no `sitemap.xml`. Low priority for a PWA but good practice.

### 17. OG image is the app icon
`og:image` points to `icon-512.png`. A dedicated OG image with text would look better in social shares.

### 18. `reading` module type not included in `ItemsByType` stats
`hooks/useStats.ts:8-13` -- `ItemsByType` only has kana, vocabulary, kanji, grammar. Reading modules are excluded from "Items Learned" count.

---

## Principle-by-Principle Verdict

| # | Principle | Verdict | Notes |
|---|-----------|---------|-------|
| 1 | DRY | **FAIL** | 3 duplications found (getExerciseMode, feedback pattern, placement generators) |
| 2 | Clean Architecture | **PASS** | Layer boundaries are respected. One stale dependency in engine. |
| 3 | Production Ready | **PASS** | Comprehensive: PWA, meta tags, security headers, privacy policy, code splitting, loading/empty states |
| 4 | Backward Compatible | **FAIL** | Supabase schema missing leech columns breaks cloud sync for SRS data |
| 5 | State of the Art | **PASS** | React 19, Vite 6, strict TypeScript, modern patterns throughout |
| 6 | Risolvere non aggirare | **PASS** | No workarounds detected. Problems are solved at the right layer. |
| 7 | Fail Loud, Never Fake | **FAIL** | AuthHandler can hang indefinitely on Supabase failure. Sound errors silently swallowed. |

---

## Recommended Fix Priority

**Before launch (same day):**
1. Add `lapse_count` and `is_leech` to Supabase schema
2. Add `.catch()` to AuthHandler `getSession()` calls
3. Export `getLeechCards` from engine barrel

**Before launch (next day):**
4. Extract `getExerciseMode` to shared location
5. Add error handling to `useDailyPlan.markComplete`
6. Fix `useStreak.lastResult` always being null

**Post-launch backlog:**
7. Extract `playFeedback` helper
8. DRY up placement exercise generators
9. Remove stale engine dependency on content
10. Add tests for sync, storage, and core hooks
11. Loading spinner for PlacementQuiz initial state
