import { test, expect, type Page } from '@playwright/test';
import { gzipSync } from 'node:zlib';

// Speed limits from the 2026-10-27 QA audit. Google calls CLS up to 0.1 "good"; these are much stricter.
// Sizes are what a first-time visitor downloads with every lazy image loaded: text files are counted
// gzipped (CloudFront sends Brotli, which is a little smaller), images and fonts as they are.
const BUDGET = {
  pageKB: { '/': 200, '/work/toyota/': 180, '/work/this-website/': 180, '/privacy/': 180 } as Record<string, number>,
  scriptKB: 15,
  fontFiles: 3,
  fontKB: 120,
  requests: 20,
  cls: 0.02,
};

interface Load { kb: number; scriptKB: number; fontFiles: number; fontKB: number; requests: number }

async function measure(page: Page, path: string): Promise<Load> {
  const sizes: Promise<{ type: string; bytes: number }>[] = [];
  page.on('response', (res) => {
    const type = res.request().resourceType();
    if (!res.url().startsWith('http://localhost') || res.status() !== 200) return;
    sizes.push(res.body().then((body) => ({ type, bytes: ['document', 'script', 'stylesheet'].includes(type) || /\.(svg|txt|json)$/.test(res.url()) ? gzipSync(body).length : body.length })).catch(() => ({ type, bytes: 0 })));
  });
  await page.goto(path);
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) img.loading = 'eager';
    await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => undefined)));
  });
  await page.waitForLoadState('networkidle');
  const all = await Promise.all(sizes);
  const kb = (list: { bytes: number }[]) => list.reduce((n, r) => n + r.bytes, 0) / 1024;
  const fonts = all.filter((r) => r.type === 'font');
  return { kb: kb(all), scriptKB: kb(all.filter((r) => r.type === 'script')), fontFiles: fonts.length, fontKB: kb(fonts), requests: all.length };
}

for (const path of Object.keys(BUDGET.pageKB)) {
  test(`page weight stays within budget on a phone: ${path}`, async ({ page, browserName }) => {
    // The budget is for one reference phone (375px wide, 1x). CI's Safari profiles have 2x and 3x screens,
    // which rightly pick bigger image copies.
    test.skip(browserName !== 'chromium', 'budget measured on the reference phone in Chromium');
    await page.setViewportSize({ width: 375, height: 800 });
    const m = await measure(page, path);
    test.info().annotations.push({ type: 'weight', description: JSON.stringify({ ...m, kb: Math.round(m.kb), scriptKB: +m.scriptKB.toFixed(1), fontKB: Math.round(m.fontKB) }) });
    expect(m.kb, 'total KB').toBeLessThanOrEqual(BUDGET.pageKB[path]);
    expect(m.scriptKB, 'JavaScript KB').toBeLessThanOrEqual(BUDGET.scriptKB);
    expect(m.fontFiles, 'font files').toBeLessThanOrEqual(BUDGET.fontFiles);
    expect(m.fontKB, 'font KB').toBeLessThanOrEqual(BUDGET.fontKB);
    expect(m.requests, 'requests').toBeLessThanOrEqual(BUDGET.requests);
  });
}

// Layout shift on a slow phone connection, where late fonts and images are most likely to move things.
test('the homepage does not jump about while it loads on a slow phone', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'network throttling needs Chromium');
  await page.setViewportSize({ width: 375, height: 800 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 90_000 });
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const cls = await page.evaluate(() => (window as any).__cls);
  test.info().annotations.push({ type: 'cls', description: String(cls) });
  expect(cls).toBeLessThanOrEqual(BUDGET.cls);
});
