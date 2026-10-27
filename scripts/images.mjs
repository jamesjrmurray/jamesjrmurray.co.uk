// Makes WebP copies of the site's photos and diagrams (the originals stay for social previews and
// JSON-LD). Uses Chrome's encoder because macOS has no WebP writer. Re-run after changing an image:
//   node scripts/images.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

// Smaller copies (-320, -640) are for phones, picked by each <img srcset>.
// Phone copies (-320, -640) are drawn at most ~1.5x their size on screen, so they take a lower quality.
const quality = (out) => (/-(320|640)\.webp$/.test(out) ? 0.72 : 0.82);
const JOBS = [
  ['public/james-murray.jpg', 'public/james-murray.webp', 480],
  ['public/james-murray.jpg', 'public/james-murray-320.webp', 320],
  ['public/talks/producttank-cardiff-51.jpg', 'public/talks/producttank-cardiff-51.webp', 960],
  ['public/talks/producttank-cardiff-51.jpg', 'public/talks/producttank-cardiff-51-640.webp', 640],
  ['public/talks/data-decoded-2025.jpg', 'public/talks/data-decoded-2025.webp', 960],
  ['public/talks/data-decoded-2025.jpg', 'public/talks/data-decoded-2025-640.webp', 640],
  ['public/talks/airia-agentic-ai-2025.jpg', 'public/talks/airia-agentic-ai-2025.webp', 960],
  ['public/architecture/c1-system-context.png', 'public/architecture/c1-system-context-640.webp', 640],
  ['public/architecture/c1-system-context.png', 'public/architecture/c1-system-context-1000.webp', 1000],
  ['public/architecture/c1-system-context.png', 'public/architecture/c1-system-context-1600.webp', 1600],
  ['public/architecture/c2-containers.png', 'public/architecture/c2-containers-640.webp', 640],
  ['public/architecture/c2-containers.png', 'public/architecture/c2-containers-1000.webp', 1000],
  ['public/architecture/c2-containers.png', 'public/architecture/c2-containers-1600.webp', 1600],
  // Drawn at most 59px wide; 180px covers 3x screens.
  ['public/logos/holiday-extras.png', 'public/logos/holiday-extras.webp', 180],
];

const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage();
for (const [src, out, width] of JOBS) {
  const mime = extname(src) === '.png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${readFileSync(src).toString('base64')}`;
  const webp = await page.evaluate(async ({ dataUrl, width, q }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const w = Math.min(width, img.naturalWidth);
    const h = Math.round((img.naturalHeight * w) / img.naturalWidth);
    const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return { url: canvas.toDataURL('image/webp', q), w, h };
  }, { dataUrl, width, q: quality(out) });
  writeFileSync(out, Buffer.from(webp.url.split(',')[1], 'base64'));
  console.log(`${out}  ${webp.w}x${webp.h}`);
}
await browser.close();
