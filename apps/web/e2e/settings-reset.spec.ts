import { test, expect } from '@playwright/test';
import { setupNewUser } from './helpers';

test.describe('Settings & Reset', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page);
  });

  test('navigating to settings and back', async ({ page }) => {
    // Click Settings icon
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.waitForURL('**/settings');

    // Should see settings page content
    await expect(page.getByText('Audio')).toBeVisible();
    await expect(page.getByText('Daily plan size')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset all progress' })).toBeVisible();

    // Go back
    await page.getByRole('button', { name: 'Go back' }).click();
    await page.waitForURL('/');
  });

  test('reset all progress redirects to Welcome', async ({ page }) => {
    // Navigate to Settings
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.waitForURL('**/settings');

    // Click Reset
    await page.getByRole('button', { name: 'Reset all progress' }).click();

    // Confirmation modal should appear
    await expect(page.getByText('This will erase everything')).toBeVisible();

    // Confirm reset
    await page.getByRole('button', { name: 'Reset', exact: true }).click();

    // Should redirect to Welcome
    await page.waitForURL('**/welcome');
    await expect(page.getByText("Let's learn Japanese")).toBeVisible();
  });

  test('cancel reset stays on settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.waitForURL('**/settings');

    await page.getByRole('button', { name: 'Reset all progress' }).click();
    await expect(page.getByText('This will erase everything')).toBeVisible();

    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Should still be on settings
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByText('Audio')).toBeVisible();
  });
});
