import { test, expect } from '@playwright/test';
import { yearsExperience } from '../../src/content/site';
import AxeBuilder from '@axe-core/playwright';

test('hero states who James is and links to the case study', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineer’s instinct.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Product thinker’s questions.');
  const cta = page.getByRole('link', { name: 'Read the case study' }).first();
  await expect(cta).toHaveAttribute('href', '/work/toyota/');
});

test('shows four stats, three work cards, career and about', async ({ page }) => {
  await page.goto('/');
  for (const v of [yearsExperience, '500B+', '2', '£500K+']) {
    await expect(page.getByTestId('stats').getByText(v, { exact: true })).toBeVisible();
  }
  await expect(page.locator('#work-cards article')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Career' })).toBeVisible();
  await expect(page.getByText('Systems Engineer · Liquid Knowledge, Wavex')).toBeVisible();
  await expect(page.locator('#about')).toContainText('Demelza Hospice');
});

test('no horizontal scroll at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
});

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
