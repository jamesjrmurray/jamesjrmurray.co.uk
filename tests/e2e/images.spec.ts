import { test, expect, type Page } from '@playwright/test';

async function loadAllImages(page: Page) {
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) img.loading = 'eager';
    await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => undefined)));
  });
}

// Each photo or diagram is downloaded at roughly the size it is drawn, not a desktop-sized file squeezed
// onto a phone. Small images (logos) and SVGs are exempt. The 2.4x allowance covers the gap between the
// nearest smaller copy and the next one up (e.g. the 640px copy drawn at 277px).
for (const path of ['/', '/work/this-website/']) {
  test(`phones download phone-sized images: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await loadAllImages(page);
    const images = await page.evaluate(async () =>
      Promise.all(Array.from(document.images).map(async (img) => {
        const file = new Image();
        file.src = img.currentSrc;
        await file.decode().catch(() => undefined);
        return { src: img.currentSrc, file: file.naturalWidth, shown: img.getBoundingClientRect().width, dpr: devicePixelRatio };
      })),
    );
    const checked = images.filter((i) => i.shown >= 100 && !i.src.endsWith('.svg'));
    expect(checked.length).toBeGreaterThan(0);
    for (const i of checked) expect(i.file, `${i.src} drawn at ${Math.round(i.shown)}px`).toBeLessThanOrEqual(Math.ceil(i.shown * i.dpr * 2.4));
  });
}
