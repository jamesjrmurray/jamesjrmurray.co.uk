import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { employerLogos } from '../../src/content/site';

describe('image files', () => {
  // The logo row is above the fold on every phone; a 24 KB PNG for a 59px logo was the worst offender.
  it('employer logos are SVG or small WebP files', () => {
    for (const l of employerLogos) {
      expect(l.src, l.name).toMatch(/\.(svg|webp)$/);
      // SVG is text, so CloudFront compresses it on the way out; measure what is actually sent.
      const file = readFileSync(`public${l.src}`);
      expect((l.src.endsWith('.svg') ? gzipSync(file) : file).length, l.name).toBeLessThan(10_000);
    }
  });
});

// The red italic accents (weight 500) and the Toyota lesson (400) use small fixed-weight subsets of
// Fraunces italic (scripts/fonts.sh) instead of the 45 KB variable font. Text outside the subset would
// fall back to a different font, so every italic phrase must fit inside it.
describe('italic heading font', () => {
  const SUBSET = /^[ -~ £–—‘’“”…→]*$/;
  it('is the small subset, not the full variable font', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).not.toContain('@fontsource-variable/fraunces/wght-italic.css');
    expect(css).toMatch(/fraunces-italic-500-subset\.woff2/);
    expect(css).toMatch(/fraunces-italic-400-subset\.woff2/);
  });
  it('covers every italic phrase on the site', async () => {
    const { hero, about, contact } = await import('../../src/content/site');
    const { toyota } = await import('../../src/content/toyota');
    for (const phrase of [hero.titleLine2, about.headingAccent, contact.headingAccent, toyota.lesson]) expect(phrase).toMatch(SUBSET);
  });
});

// A web font that swaps in after the first paint rewraps text wherever the fallback has different widths
// (CI's Linux fonts showed it: layout shift 0.056). So no face may swap: each is used only if it is ready
// for the first paint (they are preloaded), otherwise that page view keeps the fallback.
describe('web fonts never swap in late', () => {
  it('every @font-face the site defines uses font-display: optional, and none come from swap imports', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces.length).toBeGreaterThanOrEqual(5);
    for (const f of faces) expect(f).toContain('font-display: optional');
    expect(css).not.toMatch(/@import "@fontsource/);
  });
});
