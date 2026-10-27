import { test, expect } from '@playwright/test';

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('nav collapses behind a Menu button that toggles it', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: 'About' })).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('Escape closes the menu and returns focus to the button', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await button.click();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  // The menu used to render open and collapse only when its script ran, jumping the page up by a
  // quarter of the screen (CLS 0.26) whenever the script was slower than the first paint.
  test('the page does not jump when the menu script arrives late', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'layout-shift entries are Chromium-only');
    await page.route(/\/_astro\/.*\.js$/, async (r) => { await new Promise((s) => setTimeout(s, 1500)); await r.continue(); });
    await page.addInitScript(() => {
      (window as any).__cls = 0;
      new PerformanceObserver((list) => { for (const e of list.getEntries() as any[]) (window as any).__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => (window as any).__cls)).toBeLessThan(0.01);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' })).toBeHidden();
  });

  test('choosing a link closes the menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('without JavaScript', () => {
  test.use({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });
  test('links stay visible and there is no dead Menu button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  });
});

test('desktop shows links and no Menu button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' })).toBeVisible();
});
