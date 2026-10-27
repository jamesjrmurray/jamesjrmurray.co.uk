import { test, expect, type Page } from '@playwright/test';

const events = (page: Page) =>
  page.evaluate(() =>
    ((window as any).dataLayer ?? [])
      .map((a: IArguments) => Array.from(a))
      .filter((a: unknown[]) => a[0] === 'event')
      .map((a: unknown[]) => ({ name: a[1], params: a[2] })),
  );

async function stayOnPage(page: Page) {
  // Let our tracking listener run, but stop the browser navigating away.
  await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault(), true));
}

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
});

test('before consent, nothing is sent: analytics is not loaded at all', async ({ page }) => {
  await page.goto('/');
  await stayOnPage(page);
  await page.getByRole('contentinfo').getByRole('link', { name: 'LinkedIn' }).click();
  expect(await events(page)).toEqual([]);
  expect(await page.evaluate(() => typeof (window as any).gtag)).toBe('undefined');
});

test('after Accept, links record the right events', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await stayOnPage(page);
  await page.getByRole('link', { name: 'Read the case study' }).first().click();
  await page.getByRole('contentinfo').getByRole('link', { name: 'LinkedIn' }).click();
  await page.locator('#contact').getByRole('link', { name: 'Message me on LinkedIn' }).click();
  // Clicking the footer link scrolls the page, so scroll_depth also fires; this test is about clicks.
  expect((await events(page)).filter((e: any) => e.name !== 'scroll_depth' && e.name !== 'section_view')).toEqual([
    { name: 'button_click', params: { label: 'Accept', section: 'consent' } },
    { name: 'case_study_open', params: { location: 'hero' } },
    { name: 'linkedin_click', params: { location: 'footer' } },
    { name: 'linkedin_click', params: { location: 'contact' } },
  ]);
});

test('scrolling to the end records 50% and 90% once each', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => (await events(page)).filter((e: any) => e.name === 'scroll_depth').map((e: any) => e.params.percent)).toEqual([50, 90]);
});

test('header links record nav_click with their label', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await stayOnPage(page);
  const menu = page.getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
  expect(await events(page)).toContainEqual({ name: 'nav_click', params: { label: 'About' } });
});

test('homepage sections record section_view once each as they are reached', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  const sections = async () => (await events(page)).filter((e: any) => e.name === 'section_view').map((e: any) => e.params.section);
  // Wait for each section's event before scrolling on: WebKit checks intersections per frame, so an
  // instant jump past a section (which no real visitor does) can skip it.
  await page.locator('[data-section="career"]').scrollIntoViewIfNeeded();
  await expect.poll(sections).toContain('career');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(sections).toContain('hero');
  const seen = await sections();
  expect(new Set(seen).size).toBe(seen.length);
});

test('reaching the end of a case study records case_study_read', async ({ page }) => {
  await page.goto('/work/toyota/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => (await events(page)).filter((e: any) => e.name === 'case_study_read')).toEqual([
    { name: 'case_study_read', params: { page: '/work/toyota/', trigger: 'scroll' } },
  ]);
});

test('a missing page records page_not_found with its path (once analytics is accepted)', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('jm-consent-v1', 'granted'); } catch {} });
  await page.goto('/no-such-page/');
  await expect.poll(() => events(page)).toContainEqual({ name: 'page_not_found', params: { page: '/no-such-page/', referrer: '(direct)' } });
});

test('links and buttons without their own event still record a click', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Accept' }).click();
  await stayOnPage(page);
  await page.locator('[data-section="hero"]').getByRole('link', { name: 'Let’s talk' }).click();
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  const evs = await events(page);
  expect(evs).toContainEqual(expect.objectContaining({ name: 'link_click', params: expect.objectContaining({ link_url: '/#contact', section: 'hero', outbound: 'no' }) }));
  expect(evs).toContainEqual({ name: 'button_click', params: { label: 'Cookie settings', section: 'footer' } });
});
