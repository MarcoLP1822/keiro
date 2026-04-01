import { test, expect } from '@playwright/test';

test.describe('First Launch', () => {
  test('redirects to /welcome on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByText("Let's learn Japanese")).toBeVisible();
  });

  test('"I\'m starting from zero" leads to Home with hiragana content', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/welcome');

    await page.getByRole('button', { name: "I'm starting from zero" }).click();

    // Wait for Home content to appear (may take a moment for Dexie live query to update)
    await expect(page.getByText("Today's Plan")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  test('stays on Home after refresh (not Welcome)', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/welcome');

    await page.getByRole('button', { name: "I'm starting from zero" }).click();

    // Wait for Home content to fully render
    await expect(page.getByText("Today's Plan")).toBeVisible({ timeout: 10000 });

    // Refresh
    await page.reload();

    // Should still be on Home, not Welcome
    await expect(page.getByText("Today's Plan")).toBeVisible({ timeout: 10000 });
    await expect(page).not.toHaveURL(/\/welcome/);
  });
});
