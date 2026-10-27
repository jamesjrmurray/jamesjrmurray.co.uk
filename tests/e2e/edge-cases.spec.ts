import { test, expect } from '@playwright/test';

const PAGES = ['/', '/work/toyota/', '/work/this-website/', '/privacy/'];

test('print: no cookie banner, menu or cookie settings on paper', async ({ page }) => {
  await page.goto('/work/toyota/');
  await expect(page.locator('[data-consent]')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-consent]')).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Cookie settings' })).toBeHidden();
});

test.describe('with "reduce motion" switched on', () => {
  test.use({ reducedMotion: 'reduce' });
  test('nothing scrolls smoothly or animates', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    const moving = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).filter((el) => getComputedStyle(el).transitionDuration.split(',').some((d) => parseFloat(d) > 0.01)).length,
    );
    expect(moving).toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('Cookie settings is hidden, because it needs JavaScript to work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Cookie settings' })).toBeHidden();
  });
});

// WCAG 2.5.8: anything tappable outside running text is at least 24 x 24 px.
for (const path of PAGES) {
  test(`tap targets are at least 24px on a phone: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    const small = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a, button'))
        .filter((el) => !el.closest('p') && el.getAttribute('href') !== '#main')
        .map((el) => ({ text: el.textContent!.trim().slice(0, 30), box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && (box.height < 24 || box.width < 24))
        .map(({ text, box }) => `${text} ${Math.round(box.width)}x${Math.round(box.height)}`),
    );
    expect(small).toEqual([]);
  });
}

// WCAG 1.4.12: readers who widen letter, word, line and paragraph spacing lose nothing.
for (const path of PAGES) {
  test(`wider text spacing cuts nothing off: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await page.addStyleTag({ content: '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}' });
    const clipped = await page.evaluate(() =>
      Array.from(document.querySelectorAll('body *'))
        .filter((el) => el.getAttribute('href') !== '#main' && /hidden|clip/.test(getComputedStyle(el).overflow) && el.textContent!.trim())
        .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        .map((el) => el.textContent!.trim().slice(0, 40)),
    );
    expect(clipped).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
}

test('if the web fonts fail, the page still reads in system fonts without sideways scroll', async ({ page }) => {
  await page.route('**/*.woff2', (r) => r.abort());
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('if images fail, every one still has text in its place and the layout holds', async ({ page }) => {
  await page.route(/\.(webp|png|jpg|svg)$/, (r) => (r.request().resourceType() === 'image' ? r.abort() : r.continue()));
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const missingAlt = await page.evaluate(() => Array.from(document.images).filter((i) => !i.alt.trim()).length);
  expect(missingAlt).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
