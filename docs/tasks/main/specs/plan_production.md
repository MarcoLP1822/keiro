# Implementation Plan: Production Readiness (Approach B)

## Overview
Prepare Keiro PWA for public launch. Address all gaps from the production audit: icons, meta tags, privacy policy, code splitting, error handling (fail loud), CSP headers, offline UX, robots.txt.

**Error Handling Philosophy**: Fail Loud, Never Fake. Every error must be visible — banners, messages, degraded-mode indicators. No silent swallowing.

## Desired End State
- PWA install works on iOS and Android (proper icons, manifest)
- Social sharing shows title/description/image
- Privacy policy page exists (GDPR baseline)
- Routes are lazy-loaded (smaller initial bundle)
- Offline state is clearly communicated to the user
- Security headers protect against XSS/clickjacking
- Google can index the app
- ErrorBoundary shows clear error messages (no Sentry for now)

## Out of Scope
- Sentry integration (skipped, no paid plan)
- Capacitor / App Store submission
- Custom domain (will change later)
- i18n / multi-language UI
- Analytics provider integration

## Technical Approach

### Phase 1: Icons & Manifest
Generate PNG icons from existing `favicon.svg` using a Node.js script with the `sharp` library (already attempted before but failed due to interactive install — this time use `npx` inline or add as devDependency).

Files to generate:
- `apps/web/public/icon-192.png` (192x192)
- `apps/web/public/icon-512.png` (512x512)
- `apps/web/public/apple-touch-icon.png` (180x180)

Update `vite.config.ts` manifest icons to include `purpose: "any maskable"` on the 512px icon.

### Phase 2: Meta Tags & SEO
Update `apps/web/index.html`:
- `<meta name="description">` — Japanese learning app description
- `<meta property="og:title">`, `og:description`, `og:url`, `og:type`, `og:image`
- `<meta name="twitter:card">`, `twitter:title`, `twitter:description`
- `og:image` can point to the 512px icon for now

Add `apps/web/public/robots.txt`:
```
User-agent: *
Allow: /
```

### Phase 3: Privacy Policy Page
Create `apps/web/src/pages/Privacy.tsx` with a basic English privacy policy covering:
- What data is collected (email for auth, learning progress for sync)
- How data is stored (Supabase cloud, IndexedDB local)
- User rights (download data, delete account — already implemented)
- No cookies used (Supabase uses localStorage)
- Contact information

Add route `/privacy` in App.tsx. Link from Settings > About section.

### Phase 4: Code Splitting
Convert all page imports in `App.tsx` to `React.lazy()` with `Suspense` fallback (existing `LoadingPage` component).

Split content JSON into separate chunks via `vite.config.ts` `rollupOptions.output.manualChunks`:
- `vendor` chunk: react, react-dom, react-router
- `supabase` chunk: @supabase/supabase-js
- `content-n5`, `content-n4`, `content-n3` chunks
- Remove the `chunkSizeWarningLimit: 1500` suppression

### Phase 5: Error Handling — Fail Loud
Apply the "Fail Loud, Never Fake" philosophy:

1. **ErrorBoundary**: Show clear error message with "Go Home" button. Remove any Sentry references (not configured). Log to console.error for debuggability.

2. **Settings.tsx catch blocks**: Replace silent `console.error` with visible error state — show a red banner when export/delete fails.

3. **Sync failures**: Already has console.warn/error. Add a visible "Sync failed" indicator in the UI when push/pull errors occur, rather than swallowing silently.

4. **Offline detection**: Use `navigator.onLine` + `online`/`offline` events to show a banner when the user is offline. The `useOnline` hook was deleted in cleanup — recreate a minimal version, but this time actually USE it in the app shell.

### Phase 6: Security Headers
Update `apps/web/vercel.json` to add security headers:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; font-src 'self'" }
      ]
    }
  ]
}
```

## Critical Files for Implementation
- `apps/web/vite.config.ts` — PWA manifest, code splitting, chunk config
- `apps/web/index.html` — meta tags, icon links
- `apps/web/src/App.tsx` — lazy loading routes, Privacy route
- `apps/web/src/components/common/ErrorBoundary.tsx` — fail loud error display
- `apps/web/src/pages/Settings.tsx` — fail loud on export/delete errors
- `apps/web/vercel.json` — security headers
- `apps/web/public/favicon.svg` — source for icon generation
