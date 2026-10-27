import { test, expect } from '@playwright/test';
import { stats, talks } from '../../src/content/site';

test('homepage has canonical, Open Graph and Person data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:4400/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /James Murray/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'http://localhost:4400/og.png');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld['@type']).toBe('ProfilePage');
  expect(ld.mainEntity['@type']).toBe('Person');
  expect(ld.mainEntity.name).toBe('James Murray');
  expect(ld.mainEntity.sameAs).toContain('https://www.linkedin.com/in/jamesjrmurray');
  expect(ld.mainEntity.sameAs).toContain('https://github.com/jamesjrmurray');
  expect(JSON.stringify(ld)).not.toMatch(/seeking|telephone|email/i);
});

test('robots.txt blocks indexing outside prod', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Disallow: /');
});

test('llms.txt summarises the site as it is: every section and page, nothing that is not there', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^# James Murray/);
  expect(body).toContain('/work/toyota/');
  expect(body).toContain('/work/this-website/');
  expect(body).not.toMatch(/writing/i); // no posts yet, so no Writing section
  expect(body).toMatch(/projects/i);
  for (const t of talks) expect(body).toContain(t.title);
  expect(body).toContain('https://github.com/jamesjrmurray');
});

test('the 404 page asks search engines to skip it and claims no address of its own', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});

test('favicon.ico and an iPhone home-screen icon exist', async ({ page, request }) => {
  for (const [path, type] of [['/favicon.ico', 'image/'], ['/apple-touch-icon.png', 'image/png']]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-type'], path).toContain(type);
  }
  await page.goto('/');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
});

test('years of experience is worked out at build time, the same in the stats and the description', async ({ page }) => {
  const years = String(new Date().getFullYear() - 2005);
  expect(stats[0].value).toBe(years);
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', new RegExp(`\\b${years} years\\b`));
});

test('sitemap lists both pages', async ({ request }) => {
  const body = await (await request.get('/sitemap-0.xml')).text();
  expect(body).toContain('http://localhost:4400/');
  expect(body).toContain('http://localhost:4400/work/toyota/');
});

test('og.png exists', async ({ request }) => {
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('case study page carries Article structured data authored by James', async ({ page }) => {
  await page.goto('/work/toyota/');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(ld['@type']).toBe('Article');
  expect(ld.headline).toBe('Building the data foundations for AI in connected vehicles');
  expect(ld.author.name).toBe('James Murray');
});

test('each shareable page has its own social preview image', async ({ page, request }) => {
  const images: Record<string, string> = { '/': '/og.png', '/work/toyota/': '/og-toyota.png', '/work/this-website/': '/og-this-website.png' };
  for (const [path, img] of Object.entries(images)) {
    await page.goto(path);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(new RegExp(`${img.replace('.', '\\.')}$`));
    expect((await request.get(img)).status()).toBe(200);
  }
});


// Google cuts descriptions at about 155 characters and titles at about 60.
for (const path of ['/', '/work/toyota/', '/work/this-website/', '/privacy/', '/no-such-page']) {
  test(`title and description fit in a search result: ${path}`, async ({ page }) => {
    await page.goto(path);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    expect((await page.locator('meta[name="description"]').getAttribute('content'))!.length).toBeLessThanOrEqual(155);
  });
}
