// Makes favicon.ico (16, 32 and 48px, for browsers and tools that ask for it by name) and
// apple-touch-icon.png (180px, for iPhone home screens) from the J monogram in public/favicon.svg.
// Re-run after changing the monogram:   node scripts/icons.mjs
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
// iOS rounds the corners itself and fills transparency with black, so the touch icon is a full square.
const square = svg.replace(/<circle[^>]*\/>/, '<rect width="64" height="64" fill="#0B2545"/>');

const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
const page = await browser.newPage();
async function png(source, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

writeFileSync('public/apple-touch-icon.png', await png(square, 180));

// ICO container holding PNG images (supported by every current browser).
const images = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(svg, size) })));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map(({ size, data }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...images.map((i) => i.data)]));
await browser.close();
console.log('public/apple-touch-icon.png, public/favicon.ico');
