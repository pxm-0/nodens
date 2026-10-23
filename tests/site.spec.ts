import { expect, test } from '@playwright/test';

test('the exhibition supports keyboard navigation and its index dialog', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.exhibition-frame.is-active')).toHaveAttribute('data-title', 'Threshold');

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.exhibition-frame.is-active')).toHaveAttribute('data-title', 'Engineer');

  await page.getByRole('button', { name: /index/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Exhibition index' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.getByRole('link', { name: /enter engineering/i }).click();
  await expect(page).toHaveURL(/\/engineering\/$/);
});

test('reduced motion preserves keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.exhibition-frame.is-active')).toHaveAttribute('data-title', 'Engineer');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the direct index remains reachable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /index/i }).click();
    await page.getByRole('link', { name: /open full site index/i }).click();
    await expect(page).toHaveURL(/\/index\/$/);
  });
});
