import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('hero CTA opens the case study', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read the case study' }).first().click();
  await expect(page).toHaveURL(/\/work\/toyota\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Building the data foundations for AI in connected vehicles');
});

test('case study shows three decisions, trade-offs, get-in-touch note and lesson', async ({ page }) => {
  await page.goto('/work/toyota/');
  for (const h of ['Lakehouse before models', 'Privacy by design', 'Enrichment and governance before AI']) {
    await expect(page.getByRole('heading', { level: 2, name: new RegExp(h) })).toBeVisible();
  }
  await expect(page.getByText('Trade-off:')).toHaveCount(3);
  await expect(page.getByText(/better over a coffee or a call/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Let’s talk' })).toHaveAttribute('href', '/#contact');
});

test('case study works at phone width and is accessible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/work/toyota/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});

// The whole card is clickable, but screen readers announce just the title, not 200 characters of card.
test('the case-study card is named by its title and opens from anywhere on it', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-section="case_study"]');
  await expect(card.getByRole('link')).toHaveCount(1);
  await expect(card.getByRole('link')).toHaveAccessibleName('Building the data foundations for AI in connected vehicles');
  // A person clicks the teaser text; the stretched title link over it takes the click.
  const teaser = card.getByText(/The business wanted AI products/);
  await teaser.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const box = (await teaser.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/work\/toyota\/$/);
});
