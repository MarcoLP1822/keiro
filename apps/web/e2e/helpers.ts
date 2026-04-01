import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Set up a new user who selected "starting from zero" —
 * seeds IndexedDB with the first module as available.
 * Each Playwright test gets a fresh browser context (clean IndexedDB).
 */
export async function setupNewUser(page: Page) {
  await page.goto('/');
  // Should redirect to /welcome for first-time user
  await page.waitForURL('**/welcome');
  await page.getByRole('button', { name: "I'm starting from zero" }).click();
  // Wait for Home content to appear (Dexie live query may need a moment)
  await expect(page.getByText("Today's Plan")).toBeVisible({ timeout: 10000 });
}
