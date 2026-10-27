import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('unknown URL returns the branded 404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
});

test('header shows name and section links', async ({ page }) => {
  await page.goto('/');
  // On phones the links sit behind the Menu button (see mobile-nav.spec.ts).
  const menu = page.getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const [name, href] of [['Work', '/#work'], ['About', '/#about'], ['Contact', '/#contact']]) {
    await expect(nav.getByRole('link', { name })).toHaveAttribute('href', href);
  }
  // No posts yet, so the Writing section is hidden and its nav link must not dangle.
  await expect(nav.getByRole('link', { name: 'Writing' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /James Murray/ }).first()).toHaveAttribute('href', '/');
});

test('skip link is first in tab order and targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('404 page has no accessibility violations', async ({ page }) => {
  await page.goto('/no-such-page');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
