import { expect, test, type Page } from '@playwright/test';

const landingFrames = ['Offer', 'Shapes', 'Eli', 'LociGraph', 'Argus', 'Haruspex', 'Engagement', 'Contact'];
const activeFrame = (page: Page) => page.locator('.exhibition-frame.is-active');

// Walks the landing with the frame controls and checks that nothing is cut off.
async function expectEveryFrameToFit(page: Page, { allowInnerScroll = false } = {}) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const title of landingFrames) {
    await expect(activeFrame(page)).toHaveAttribute('data-title', title);
    const excess = await activeFrame(page)
      .locator('.frame-inner')
      .evaluate((inner) => ({ wide: inner.scrollWidth - inner.clientWidth, tall: inner.scrollHeight - inner.clientHeight }));
    expect(excess.wide, `${title} overflows sideways`).toBeLessThanOrEqual(0);
    if (!allowInnerScroll) expect(excess.tall, `${title} is taller than the screen`).toBeLessThanOrEqual(0);
    await page.waitForTimeout(50);
    await page.getByRole('button', { name: 'Next frame' }).click();
  }
}

test('the landing opens on the offer and its action', async ({ page }) => {
  await page.goto('/');
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Offer');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Engineering\s*that stays\s*until it\s*runs\./);

  // Without PUBLIC_BOOKING_URL the action is the contact email, on the first frame and the last.
  const actions = page.locator('a.practice-action');
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all()) {
    await expect(action).toHaveAttribute('href', 'mailto:dustin@nodens.dev');
  }
  await expect(page.getByRole('link', { name: /start a conversation/i })).toBeInViewport();
});

test('the landing moves frame by frame, like the exhibition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const title of landingFrames) {
    await expect(activeFrame(page)).toHaveAttribute('data-title', title);
    if (title === 'Shapes') {
      for (const shape of ['Automate', 'Build', 'Embed']) {
        await expect(page.getByRole('heading', { level: 3, name: shape, exact: true })).toBeVisible();
      }
    }
    await page.waitForTimeout(50);
    await page.keyboard.press('ArrowRight');
  }
  // The sequence wraps, as the exhibition's does.
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Offer');
});

test('"See the work" jumps to the evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /see the work/i }).click();
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Eli');
  await expect(page.getByRole('heading', { level: 2, name: 'Eli', exact: true })).toBeVisible();
});

test('Space on a focused control presses it, and focus follows into the new frame', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /see the work/i }).focus();
  await page.keyboard.press('Space');
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Eli');
  await expect(activeFrame(page)).toBeFocused();
});

test('the landing index lists every frame and leads to the exhibition and the work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /index/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Practice index' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#frameIndex button strong')).toHaveText(landingFrames);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  const primary = page.getByRole('navigation', { name: 'Primary' });
  await primary.getByRole('link', { name: 'Exhibition' }).click();
  await expect(page).toHaveURL(/\/exhibition\/$/);
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Threshold');

  await page.goto('/');
  await primary.getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/engineering\/$/);
});

test('every landing frame fits a laptop screen', async ({ page }) => {
  await expectEveryFrameToFit(page);
});

test('the exhibition supports keyboard navigation and its index dialog', async ({ page }) => {
  await page.goto('/exhibition/');
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Threshold');

  await page.keyboard.press('ArrowRight');
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Engineer');

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
  await expect(activeFrame(page)).toHaveAttribute('data-title', 'Engineer');
});

test('section pages return to the exhibition, not the landing', async ({ page }) => {
  await page.goto('/coffee/');
  await page.getByRole('link', { name: /return to exhibition/i }).click();
  await expect(page).toHaveURL(/\/exhibition\/$/);
});

test('the work page never leads to a maintenance notice', async ({ page }) => {
  await page.goto('/engineering/');
  // No record is published yet, so no card links to a record page.
  await expect(page.locator('a[href^="/engineering/projects/"]')).toHaveCount(0);
  await expect(page.locator('#eli').getByRole('link', { name: /live/i })).toBeVisible();

  const response = await page.goto('/engineering/projects/eli/');
  expect(response?.status()).toBe(404);
});

test('an entry sends its related project to that project on the work page', async ({ page }) => {
  await page.goto('/engineering/locigraph-phase-four/');
  await page.getByRole('complementary', { name: 'Related projects' }).getByRole('link', { name: 'LociGraph' }).click();
  await expect(page).toHaveURL(/\/engineering\/#locigraph$/);
  await expect(page.locator('#locigraph')).toBeInViewport();
});

test.describe('mobile', () => {
  // Shorter than the device, as a phone browser's own bars leave it.
  test.use({ viewport: { width: 390, height: 700 } });

  test('the direct index remains reachable', async ({ page }) => {
    await page.goto('/exhibition/');
    await page.getByRole('button', { name: /index/i }).click();
    await page.getByRole('link', { name: /open full site index/i }).click();
    await expect(page).toHaveURL(/\/index\/$/);
  });

  test('every landing frame fits the screen', async ({ page }) => {
    await expectEveryFrameToFit(page);
  });

  test('the landing keeps its action and its way out in reach', async ({ page }) => {
    await page.goto('/');
    const primary = page.getByRole('navigation', { name: 'Primary' });
    await expect(primary.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(primary.getByRole('link', { name: 'Exhibition' })).toBeVisible();
    await expect(page.getByRole('link', { name: /start a conversation/i })).toBeInViewport();
  });
});

test.describe('short window', () => {
  test.use({ viewport: { width: 900, height: 480 } });

  test('a frame taller than the window scrolls before the keys change frame', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const inner = activeFrame(page).locator('.frame-inner');
    expect(await inner.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => inner.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(activeFrame(page)).toHaveAttribute('data-title', 'Offer');

    // Once the frame has nothing left to show, the same key moves on.
    for (let press = 0; press < 6; press++) {
      await page.waitForTimeout(50);
      await page.keyboard.press('ArrowDown');
    }
    await expect(activeFrame(page)).not.toHaveAttribute('data-title', 'Offer');
  });
});

test.describe('small phone', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  // A frame may scroll inside itself here, but never sideways.
  test('no landing frame overflows sideways', async ({ page }) => {
    await expectEveryFrameToFit(page, { allowInnerScroll: true });
  });
});
