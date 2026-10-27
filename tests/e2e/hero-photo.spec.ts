import { test, expect } from '@playwright/test';

test('desktop: round photo of James sits to the right of the headline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const photo = page.getByRole('img', { name: 'James Murray', exact: true });
  await expect(photo).toBeVisible();
  expect(await photo.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0)).toBe(true);
  // circular: radius at least half the width (Tailwind 4 uses an 'infinite' px radius for rounded-full)
  expect(await photo.evaluate((e) => parseFloat(getComputedStyle(e).borderRadius) >= e.getBoundingClientRect().width / 2)).toBe(true);
  const p = (await photo.boundingBox())!;
  const h1 = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
  expect(p.x).toBeGreaterThan(h1.x + h1.width / 2);
  expect(p.width).toBeGreaterThanOrEqual(160);
  expect(p.width).toBeLessThanOrEqual(240);
});

test('phone: photo sits above the headline and nothing scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const p = (await page.getByRole('img', { name: 'James Murray', exact: true }).boundingBox())!;
  const h1 = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
  expect(p.y + p.height).toBeLessThanOrEqual(h1.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('structured data gives search and AI tools the photo', async ({ page }) => {
  await page.goto('/');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld.mainEntity.image).toMatch(/\/james-murray\.jpg$/);
});
