# Task Context: Production Readiness

## Feature/Problem
Make Keiro PWA ready for public launch. Address all gaps identified in the production readiness audit.

## Architecture Patterns
- **Monorepo**: pnpm workspaces — apps/web, apps/admin, packages/engine, packages/content, packages/types
- **Framework**: React 19 + Vite 6 + Tailwind CSS v4
- **Storage**: Dexie.js (IndexedDB) local-first, Supabase cloud sync
- **Auth**: Supabase email OTP
- **PWA**: vite-plugin-pwa (Workbox) with precaching
- **Hosting**: Vercel (auto-deploy from main)
- **Error tracking**: @sentry/react (imported but DSN not configured)
- **Design**: Apple HIG system with CSS variables

## Dependencies
- vite-plugin-pwa (Workbox config in vite.config.ts)
- @sentry/react (services/sentry.ts)
- @supabase/supabase-js (services/supabase.ts)
- vercel.json (SPA rewrites only, no headers)

## Findings from Audit

### BLOCKERS (must fix before launch)

#### 1. PNG Icons Missing
- `apps/web/public/` only has `favicon.svg`
- vite.config.ts references `icon-192.png` and `icon-512.png` that don't exist → PWA install broken
- `index.html` references `apple-touch-icon.png` that doesn't exist → iOS home screen icon broken
- Need: 192x192, 512x512 PNG + 180x180 apple-touch-icon + maskable variant

#### 2. No Privacy Policy
- App uses Supabase (auth + sync) and Sentry (error tracking)
- GDPR requires privacy policy disclosure
- Apple App Store (if ever) requires privacy policy URL
- Need: `/privacy` route with policy page

#### 3. No Meta Tags for SEO/Social
- index.html has no description, og:title, og:description, og:image, twitter:card
- Sharing the link shows blank unfurl on social media
- Google can't index properly without description

#### 4. Service Role Key Security
- apps/admin/.env has real service-role key with VITE_ prefix
- VITE_ prefix means Vite would expose it in browser bundle if admin were built
- .gitignore should exclude it but needs verification
- Key should NOT use VITE_ prefix

### IMPORTANT (strong quality impact)

#### 5. No Code Splitting
- All 15 pages imported statically in App.tsx
- All content JSON (N5/N4/N3 vocab, kanji, grammar, reading) in single bundle
- vite.config.ts raises chunkSizeWarningLimit to 1500 to suppress warnings
- Need: React.lazy() for routes, manual chunks for content

#### 6. ErrorBoundary Doesn't Report to Sentry
- ErrorBoundary.tsx catches errors for display but never calls Sentry.captureException
- Production errors are invisible
- services/sentry.ts exists but needs DSN env var in Vercel

#### 7. No Offline Fallback UI
- Workbox precaches static assets but no runtimeCaching for API calls
- Supabase calls while offline → unhandled network error, no user feedback
- Core studying works offline (Dexie-first) but sync/auth silently fail
- Need: offline indicator banner, graceful error handling

#### 8. No CSP Headers
- vercel.json only has SPA rewrites, no security headers
- No Content-Security-Policy, X-Frame-Options, etc.

#### 9. No robots.txt
- Needed for Google indexing

### NICE-TO-HAVE

#### 10. SegmentedControl aria-label hardcoded
#### 11. Settings.tsx catch blocks have no user feedback
#### 12. Maskable icon purpose for Android adaptive icons

## Error Handling Philosophy: Fail Loud, Never Fake

Prefer a visible failure over a silent fallback.

- Never silently swallow errors to keep things "working."
  Surface the error. Don't substitute placeholder data.
- Fallbacks are acceptable only when disclosed. Show a
  banner, log a warning, annotate the output.
- Design for debuggability, not cosmetic stability.

Priority order:
1. Works correctly with real data
2. Falls back visibly — clearly signals degraded mode
3. Fails with a clear error message
4. Silently degrades to look "fine" — never do this

## Clarifications
- Icons: generate PNGs from existing favicon.svg programmatically
- Privacy Policy: write a basic English policy covering Supabase auth/sync
- Sentry: SKIP for now (no paid plan). ErrorBoundary should show visible errors only.
- Domain: https://keiro-web-smoky.vercel.app/ (will change to custom domain later)

## Selected Approach: B (Quality Launch)

## Implementation Approaches

### Approach A: Minimal Launch (fastest)
Generate icons programmatically, add privacy policy page, add meta tags, add robots.txt. Skip code splitting and CSP for now.
- **Pro**: Ship in 1-2 sessions
- **Con**: Large bundle, no error monitoring, no security headers

### Approach B: Quality Launch (recommended)
All of Approach A + code splitting + Sentry integration + CSP headers + offline banner.
- **Pro**: Professional quality, proper monitoring, good performance
- **Con**: 2-3 sessions

### Approach C: App Store Ready
All of Approach B + Capacitor wrapper + native splash screens + App Store screenshots.
- **Pro**: iOS/Android App Store presence
- **Con**: 4-5 sessions, $99/year Apple Developer account

## Impact Summary
- 15 pages in web app, all need lazy loading
- 1 file for icons (generate from SVG)
- 1 new page (privacy policy)
- 3 config files (index.html, vercel.json, vite.config.ts)
- 1 component fix (ErrorBoundary → Sentry)
