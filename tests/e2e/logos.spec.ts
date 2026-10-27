import { test, expect } from '@playwright/test';

const COMPANIES = ['Holiday Extras', 'Toyota Connected Europe', 'RS Components', 'Direct Line Group'];

test('hero shows employer logos in one row, each named for screen readers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const row = page.getByRole('list', { name: 'Where I’ve built products' });
  await expect(row.getByRole('img')).toHaveCount(4);
  for (const name of COMPANIES) await expect(row.getByRole('img', { name })).toBeVisible();
  const boxes = await row.getByRole('img').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  for (const b of boxes) {
    expect(b.height).toBeGreaterThan(20);
    expect(b.height).toBeLessThanOrEqual(40);
  }
  // one row on desktop: every logo is vertically centred on the same line (±2px)
  const mids = boxes.map((b) => b.top + b.height / 2);
  expect(Math.max(...mids) - Math.min(...mids)).toBeLessThanOrEqual(2);
});

test('every logo file loads', async ({ page }) => {
  await page.goto('/');
  const ok = await page.getByRole('list', { name: 'Where I’ve built products' }).getByRole('img').evaluateAll((els) =>
    els.map((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0),
  );
  expect(ok).toEqual([true, true, true, true]);
});

test('logos wrap without sideways scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
