import { test, expect, type Page } from '@playwright/test';

function trackGa(page: Page) {
  const hits: string[] = [];
  page.on('request', (r) => { if (/googletagmanager\.com|google-analytics\.com/.test(r.url())) hits.push(r.url()); });
  return hits;
}

// Consent Mode commands queued in dataLayer: [['default', {...}], ['update', {...}], ...].
const consentCalls = (page: Page) =>
  page.evaluate(() =>
    ((window as any).dataLayer ?? [])
      .map((a: IArguments) => Array.from(a))
      .filter((a: unknown[]) => a[0] === 'consent')
      .map((a: any[]) => [a[1], a[2].analytics_storage]),
  );

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
});

test('before a choice nothing loads from Google; banner offers equal choices', async ({ page, context }) => {
  const hits = trackGa(page);
  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Cookie consent' });
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Accept' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Reject' })).toBeVisible();
  await page.waitForTimeout(1000);
  expect(hits).toEqual([]);
  expect(await consentCalls(page)).toEqual([]);
  expect((await context.cookies()).some((c) => c.name.startsWith('_ga'))).toBe(false);
});

test('Accept loads analytics with storage granted, and is remembered', async ({ page }) => {
  const hits = trackGa(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  expect(await consentCalls(page)).toEqual([['default', 'granted']]);
  await expect.poll(() => hits.length).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden();
  expect(await consentCalls(page)).toEqual([['default', 'granted']]);
});

test('Reject is remembered and analytics never loads', async ({ page }) => {
  const hits = trackGa(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden();
  await page.waitForTimeout(500);
  expect(await consentCalls(page)).toEqual([]);
  expect(hits).toEqual([]);
});

test('Cookie settings reopens the banner', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reject' }).click();
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible();
});

test('blocked storage: banner works and page does not error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept' }).click();
  expect(await consentCalls(page)).toEqual([['default', 'granted']]);
  expect(errors).toEqual([]);
});

test('withdrawing consent reloads without analytics and keeps the banner closed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Reject' }).click(),
  ]);
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden();
  expect(await consentCalls(page)).toEqual([]);
});

test('declined consent clears leftover GA cookies on every load', async ({ page, context }) => {
  await context.addCookies([{ name: '_ga', value: 'GA1.1.123.456', url: 'http://localhost:4400' }]);
  await page.addInitScript(() => { try { localStorage.setItem('jm-consent-v1', 'denied'); } catch {} });
  await page.goto('/');
  await expect.poll(async () => (await context.cookies()).some((c) => c.name.startsWith('_ga'))).toBe(false);
});

test('reopened banner: Escape closes it and focus returns to Cookie settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reject' }).click();
  const settings = page.getByRole('button', { name: 'Cookie settings' });
  await settings.click();
  await expect(page.getByRole('button', { name: 'Accept' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeHidden();
  await expect(settings).toBeFocused();
});

test('choosing in a reopened banner returns focus to Cookie settings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reject' }).click();
  const settings = page.getByRole('button', { name: 'Cookie settings' });
  await settings.click();
  await page.getByRole('button', { name: 'Reject' }).click();
  await expect(settings).toBeFocused();
});

test('first-visit choice moves focus to main content, not lost to body', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Reject' }).click();
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  expect(focusedId).toBe('main');
});

// A keyboard user meets the choice before the page, and the fixed banner never hides what has focus.
test('keyboard: the banner comes straight after the skip link, before the header', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-consent]'))).toBe(true);
});
