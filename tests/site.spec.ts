import { expect, test } from '@playwright/test';

test('the landing states the offer, the proof and the next action', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Engineering\s*that stays\s*until it\s*runs\./);

  for (const shape of ['Automate', 'Build', 'Embed']) {
    await expect(page.getByRole('heading', { level: 3, name: shape, exact: true })).toBeVisible();
  }

  // A live product leads the evidence; the rest follow their feature rank.
  await expect(page.locator('#evidence h3')).toHaveText(['Eli', 'LociGraph', 'Argus', 'Haruspex']);

  // Without PUBLIC_BOOKING_URL the action is the contact email.
  const actions = page.getByRole('link', { name: /start a conversation/i });
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) {
    await expect(action).toHaveAttribute('href', 'mailto:dustin@nodens.dev');
  }

  await expect(page.locator('.exhibition-frame')).toHaveCount(0);
});

test('the landing leads to the exhibition and to the work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Exhibition' }).click();
  await expect(page).toHaveURL(/\/exhibition\/$/);
  await expect(page.locator('.exhibition-frame.is-active')).toHaveAttribute('data-title', 'Threshold');

  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/engineering\/$/);
});

test('the exhibition supports keyboard navigation and its index dialog', async ({ page }) => {
  await page.goto('/exhibition/');
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
  await page.goto('/exhibition/');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.exhibition-frame.is-active')).toHaveAttribute('data-title', 'Engineer');
});

test('section pages return to the exhibition, not the landing', async ({ page }) => {
  await page.goto('/coffee/');
  await page.getByRole('link', { name: /return to exhibition/i }).click();
  await expect(page).toHaveURL(/\/exhibition\/$/);
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the direct index remains reachable', async ({ page }) => {
    await page.goto('/exhibition/');
    await page.getByRole('button', { name: /index/i }).click();
    await page.getByRole('link', { name: /open full site index/i }).click();
    await expect(page).toHaveURL(/\/index\/$/);
  });

  test('the landing fits the viewport and keeps its action in reach', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    const primary = page.getByRole('navigation', { name: 'Primary' });
    await expect(primary.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(primary.getByRole('link', { name: 'Exhibition' })).toBeVisible();
    await expect(page.getByRole('link', { name: /start a conversation/i }).first()).toBeInViewport();
  });
});

test.describe('small phone', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('the landing does not scroll sideways', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
