import { test, expect } from '@playwright/test';

test('write-up page: title, sections in order, diagrams load', async ({ page }) => {
  const res = await page.goto('/work/this-website/');
  expect(res?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How I built this website with AI');
  const h2 = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(h2.map((t) => t.trim())).toEqual(['The brief', 'How we worked', 'Key decisions', 'Security', 'Architecture', 'What I learned']);
  const imgs = page.locator('figure img');
  await expect(imgs).toHaveCount(2);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect((await img.getAttribute('alt'))?.length).toBeGreaterThan(10);
  }
  await expect(page.getByRole('heading', { level: 2, name: 'What I learned' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Code on GitHub' })).toHaveAttribute('href', 'https://github.com/jamesjrmurray/jamesjrmurray.co.uk');
});

test('write-up page: no sideways scroll on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/work/this-website/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('homepage links to the write-up and llms.txt lists it', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('#projects a[href="/work/this-website/"]')).toHaveCount(1);
  expect(await (await request.get('/llms.txt')).text()).toContain('/work/this-website/');
});
