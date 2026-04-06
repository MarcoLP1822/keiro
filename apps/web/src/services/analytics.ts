// Lightweight analytics abstraction
// Logs events in development, can be wired to a real provider in production

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  if (import.meta.env.DEV) {
    console.log('[analytics]', name, properties);
    return;
  }
  // In production: wire to your analytics provider here
  // e.g., Plausible, PostHog, or Vercel Analytics
}

export const events = {
  moduleComplete: (moduleId: string, score: number, passed: boolean) =>
    trackEvent('module_complete', { moduleId, score, passed }),
  placementComplete: (startModule: string) =>
    trackEvent('placement_complete', { startModule }),
};
