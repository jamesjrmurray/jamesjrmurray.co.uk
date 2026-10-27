import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const card = fileURLToPath(new URL('./og-card.html', import.meta.url));
// One social preview per shareable page. The homepage uses og-card.html as written; others swap the
// headline and footer. Run after changing any of them: node scripts/og.mjs
const VARIANTS = [
  { out: 'public/og.png' },
  { out: 'public/og-toyota.png', h1: 'Building the data foundations<br><em>for AI in connected vehicles.</em>', foot: 'Case study · jamesjrmurray.co.uk' },
  { out: 'public/og-this-website.png', h1: 'How I built this website<br><em>with AI.</em>', foot: 'Project · jamesjrmurray.co.uk' },
];
// Playwright's bundled Chromium doesn't support macOS 13: use installed Chrome locally.
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const v of VARIANTS) {
  await page.goto(`file://${card}`, { waitUntil: 'networkidle' });
  if (v.h1) {
    await page.evaluate(({ h1, foot }) => {
      const h = document.querySelector('h1');
      h.innerHTML = h1;
      h.style.fontSize = '64px';
      document.querySelector('.foot').textContent = foot;
    }, v);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: v.out });
  console.log(`Wrote ${v.out}`);
}
await browser.close();
