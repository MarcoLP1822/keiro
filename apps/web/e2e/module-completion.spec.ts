import { test, expect } from '@playwright/test';
import { setupNewUser } from './helpers';

test.describe('Module Completion', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page);
  });

  test('completing exercises shows score and action buttons', async ({ page }) => {
    // Navigate through: Start -> Intro -> Exercises
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Begin' }).click();

    // Complete all exercises
    await completeAllExercises(page);

    // Should be on module complete page
    await page.waitForURL('**/complete', { timeout: 60000 });

    // Score should be visible
    await expect(page.getByText(/\d+%/)).toBeVisible();

    // Should have action buttons (Move on if passed, Try again if failed)
    const moveOn = page.getByRole('button', { name: 'Move on' });
    const tryAgain = page.getByRole('button', { name: 'Try again' });
    const hasAction = await moveOn.isVisible().catch(() => false) ||
                      await tryAgain.isVisible().catch(() => false);
    expect(hasAction).toBeTruthy();
  });

  test('action button navigates away from complete page', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Begin' }).click();

    await completeAllExercises(page);
    await page.waitForURL('**/complete', { timeout: 60000 });

    // Click whichever action is available
    const moveOn = page.getByRole('button', { name: 'Move on' });
    const tryAgain = page.getByRole('button', { name: 'Try again' });

    if (await moveOn.isVisible().catch(() => false)) {
      await moveOn.click();
      // Should navigate to Home
      await page.waitForURL('/');
    } else if (await tryAgain.isVisible().catch(() => false)) {
      await tryAgain.click();
      // Should navigate to exercises
      await expect(page.url()).toContain('/exercises');
    }
  });
});

async function completeAllExercises(page: import('@playwright/test').Page) {
  for (let i = 0; i < 30; i++) {
    if (page.url().includes('/complete')) return;

    const answerButtons = page.locator('button:not([disabled])');
    const count = await answerButtons.count();

    let clicked = false;
    for (let j = 0; j < count; j++) {
      const btn = answerButtons.nth(j);
      const text = (await btn.textContent())?.trim() ?? '';
      const ariaLabel = await btn.getAttribute('aria-label');
      if (['Start', 'Begin', 'Next', 'Exit', 'Go back', ''].includes(text)) continue;
      if (ariaLabel === 'Go back' || ariaLabel === 'Path Map' || ariaLabel === 'Settings') continue;
      if (text === 'Next') continue;

      await btn.click();
      clicked = true;
      break;
    }

    if (!clicked) {
      const nextBtn = page.getByRole('button', { name: 'Next' });
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
      await page.waitForTimeout(500);
      continue;
    }

    await page.waitForTimeout(300);
    const nextBtn = page.getByRole('button', { name: 'Next' });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    } else {
      await page.waitForTimeout(1800);
    }
  }
}
