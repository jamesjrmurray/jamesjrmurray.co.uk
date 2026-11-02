import { test, expect } from '@playwright/test';

test('talks: one card per talk, each with a loaded image and a link to the LinkedIn post', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#talks');
  await expect(section.getByRole('heading', { name: 'Talks', level: 2 })).toBeVisible();
  const cards = section.locator('article');
  await expect(cards).toHaveCount(2);
  for (let i = 0; i < 2; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const img = card.locator('img');
    await expect.poll(() => img.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0)).toBe(true);
    for (const link of await card.getByRole('link').all()) await expect(link).toHaveAttribute('href', /^https:\/\/www\.linkedin\.com\/posts\//);
  }
});

test('speaking is in the main nav and opens the talks section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Speaking' });
  await expect(link).toHaveAttribute('href', '/#talks');
  await expect(page.locator('#talks')).toBeVisible();
});

test('speaking is in the phone menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Speaking' })).toBeVisible();
});

test('talks offer an invite, a speaking email, and the two public profiles', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#talks');
  await expect(section.getByRole('link', { name: 'Invite me to speak' })).toHaveAttribute('href', 'https://www.linkedin.com/in/jamesjrmurray');
  await expect(section.getByRole('link', { name: 'Email about speaking' })).toHaveAttribute('href', 'mailto:jamesjrmurray@gmail.com?subject=Speaking%20enquiry');
  await expect(section.getByRole('link', { name: 'Recruited article' })).toHaveAttribute('href', 'https://www.recruited.tech/blog/preparing-data-for-ai');
  await expect(section.getByRole('link', { name: 'Data Decoded speaker profile' })).toHaveAttribute('href', 'https://datadecoded.com/mcr/speakers/james-murray/');
});

test('talks: phone layout stacks cards with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const boxes = await page.locator('#talks article').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
  expect(boxes[1]).toBeGreaterThan(boxes[0]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
