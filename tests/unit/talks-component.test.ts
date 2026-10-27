import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Talks from '../../src/components/Talks.astro';
import type { Talk } from '../../src/content/types';
import { talks } from '../../src/content/site';
import { isValidTalk } from '../../src/lib/talks';
import fs from 'node:fs';
import path from 'node:path';

const t = (title: string, date: string, extra: Partial<Talk> = {}): Talk => ({
  event: 'ProductTank Cardiff #51', date, title, quote: 'A line', url: 'https://example.com/x',
  image: '/talks/x.jpg', imageWidth: 960, imageHeight: 540, imageAlt: 'Poster', ...extra,
});

describe('Talks component', () => {
  it('renders nothing when there are no talks', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Talks, { props: { talks: [] } });
    expect(html).not.toContain('id="talks"');
  });
  it('renders the newest three, newest first', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Talks, {
      props: { talks: [t('A', '2025-10-21'), t('B', '2025-12-02'), t('C', '2025-11-25'), t('D', '2024-01-01')] },
    });
    const order = ['B', 'C', 'A'].map((x) => html.indexOf(`>${x}</a>`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html).not.toContain('>D</a>');
  });
  it('links only the title, tracks the click, and gives the image alt text and size', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Talks, { props: { talks: [t('A talk', '2025-11-25')] } });
    const anchors = [...html.matchAll(/<a [^>]*href="https:\/\/example\.com\/x"[^>]*>([\s\S]*?)<\/a>/g)];
    expect(anchors.map((m) => m[1].trim())).toEqual(['A talk']);
    expect(anchors[0][0]).toContain('data-track="talk_click"');
    expect(html).toMatch(/<img [^>]*alt="Poster"[^>]*width="960"[^>]*height="540"/);
  });
  it('skips talks with missing details', () => {
    expect(isValidTalk(t('', '2025-11-25'))).toBe(false);
    expect(isValidTalk(t('X', '2025-02-30'))).toBe(false);
    expect(isValidTalk(t('X', '2025-11-25', { url: 'http://x' }))).toBe(false);
    expect(isValidTalk(t('X', '2025-11-25', { imageAlt: ' ' }))).toBe(false);
  });
});

describe('a talk given at several events', () => {
  it('links each event separately with its own date, and drops the whole-card link', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Talks, { props: { talks: [t('Same talk', '2025-12-02', {
      events: [
        { name: 'ProductTank Cardiff #51', date: '2025-11-25', url: 'https://example.com/cardiff' },
        { name: 'Airia, London', date: '2025-12-02', url: 'https://example.com/airia' },
      ],
    })] } });
    expect(html).toMatch(/href="https:\/\/example\.com\/cardiff"[^>]*>ProductTank Cardiff #51 · 25 Nov 2025 →</);
    expect(html).toMatch(/href="https:\/\/example\.com\/airia"[^>]*>Airia, London · 2 Dec 2025 →</);
    expect(html).not.toContain('after:absolute');
  });
});

describe('talks content', () => {
  it('every talk is valid, links to LinkedIn and has its image in public/', () => {
    expect(talks.length).toBeGreaterThan(0);
    for (const x of talks) {
      expect(isValidTalk(x)).toBe(true);
      expect(x.url).toMatch(/^https:\/\/www\.linkedin\.com\/posts\//);
      expect(x.url).not.toContain('?');
      expect(fs.existsSync(path.join(process.cwd(), 'public', x.image))).toBe(true);
    }
  });
});
