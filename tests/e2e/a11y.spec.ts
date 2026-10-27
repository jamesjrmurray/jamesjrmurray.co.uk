import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/work/toyota/', '/work/this-website/', '/privacy/', '/no-such-page'];

// WCAG 1.4.10 Reflow: at 320 CSS px (400% zoom on a 1280 screen) nothing scrolls sideways. 280px is a
// folded Galaxy Z Fold, below WCAG's floor but a real phone.
for (const width of [280, 320]) {
  for (const path of PAGES) {
    test(`reflow at ${width}px: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 640 });
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
}

test('keyboard: skip link comes first, and focus is always visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { tag: el.tagName, outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0, shadow: s.boxShadow !== 'none' };
    });
    expect(ring.outline || ring.shadow, `focus ring on ${ring.tag} #${i}`).toBe(true);
  }
});

// Automated WCAG 2.2 AA scan of every page, at phone and desktop width, with the cookie banner showing
// (first visit) and with it closed.
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
for (const width of [375, 1280]) {
  for (const path of PAGES) {
    test(`no accessibility violations at ${width}px, banner open then closed: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
      await page.getByRole('button', { name: 'Reject' }).click();
      expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
    });
  }
}

test('no accessibility violations with the phone menu open', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  expect((await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations).toEqual([]);
});
