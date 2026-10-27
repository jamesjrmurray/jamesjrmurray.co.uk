import { test, expect } from '@playwright/test';

test('body text uses Instrument Sans', async ({ page }) => {
  await page.goto('/');
  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Instrument Sans Variable');
});

// The red italic hero line is above the fold, so the homepage preloads its (small) font too.
test('heading (upright and italic) and body fonts are preloaded', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('link[rel="preload"][as="font"]').evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
  expect(hrefs.some((h) => /fraunces-latin-wght-normal.*\.woff2$/.test(h))).toBe(true);
  expect(hrefs.some((h) => /fraunces-italic-500-subset.*\.woff2$/.test(h))).toBe(true);
  expect(hrefs.some((h) => /instrument-sans-latin-wght-normal.*\.woff2$/.test(h))).toBe(true);
});

test('pages without italic headings do not preload the italic font', async ({ page }) => {
  await page.goto('/privacy/');
  const hrefs = await page.locator('link[rel="preload"][as="font"]').evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
  expect(hrefs.some((h) => /italic/.test(h))).toBe(false);
});

test('the italic accents use the 500 subset and nothing downloads the full italic font', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'font') fonts.push(r.url()); });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(fonts.some((f) => /fraunces-italic-500-subset/.test(f))).toBe(true);
  expect(fonts.some((f) => /wght-italic/.test(f))).toBe(false);
  const family = await page.locator('h1 em').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toContain('Fraunces Variable');
});
