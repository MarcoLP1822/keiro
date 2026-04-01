import { test, expect } from '@playwright/test';
import { setupNewUser } from './helpers';

test.describe('Study Session', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page);
  });

  test('full study flow: Start -> Intro -> Exercises -> Complete', async ({ page }) => {
    // On Home, click Start
    await page.getByRole('button', { name: 'Start' }).click();

    // Should be on the intro page
    await expect(page.getByRole('button', { name: 'Begin' })).toBeVisible();

    // Click Begin to start exercises
    await page.getByRole('button', { name: 'Begin' }).click();

    // Complete all exercises by clicking the first answer option each time
    await completeAllExercises(page);

    // Should be on module complete page now
    await page.waitForURL('**/complete', { timeout: 60000 });
    await expect(page.getByText(/\d+%/)).toBeVisible();
  });
});

/**
 * Answer all exercises by always clicking the first available answer option.
 * Handles both correct (auto-advance) and incorrect (click Next) feedback.
 */
async function completeAllExercises(page: import('@playwright/test').Page) {
  for (let i = 0; i < 30; i++) {
    // Check if we've reached the complete page
    if (page.url().includes('/complete')) return;

    // Wait for an answer option to appear
    // Answer options are buttons with short text that aren't navigation buttons
    const answerButtons = page.locator('button:not([disabled])');
    const count = await answerButtons.count();

    let clicked = false;
    for (let j = 0; j < count; j++) {
      const btn = answerButtons.nth(j);
      const text = (await btn.textContent())?.trim() ?? '';
      const ariaLabel = await btn.getAttribute('aria-label');
      // Skip nav/action buttons, target answer option buttons
      if (['Start', 'Begin', 'Next', 'Exit', 'Go back', ''].includes(text)) continue;
      if (ariaLabel === 'Go back' || ariaLabel === 'Path Map' || ariaLabel === 'Settings') continue;
      // Skip the feedback "Next" button and progress counter
      if (text === 'Next') continue;

      await btn.click();
      clicked = true;
      break;
    }

    if (!clicked) {
      // May need to click Next for incorrect feedback
      const nextBtn = page.getByRole('button', { name: 'Next' });
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
      }
      await page.waitForTimeout(500);
      continue;
    }

    // Wait for feedback, then handle it
    await page.waitForTimeout(300);

    // If incorrect, click Next; if correct, wait for auto-advance
    const nextBtn = page.getByRole('button', { name: 'Next' });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    } else {
      // Auto-advancing for correct answer
      await page.waitForTimeout(1800);
    }
  }
}
