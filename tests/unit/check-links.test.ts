import { describe, it, expect } from 'vitest';
import { findBrokenLinks } from '../../scripts/check-links.mjs';

const origin = 'https://example.test';
const files = new Set(['index.html', 'work/toyota/index.html', 'og.png', 'img/a-640.webp', 'img/a.webp', 'sitemap-0.xml', 'llms.txt']);
const check = (pages: Record<string, string>) => findBrokenLinks({ pages: new Map(Object.entries(pages)), files, origin }).map((b: { link: string }) => b.link);

describe('findBrokenLinks', () => {
  it('passes links, images, srcsets, anchors and external URLs that resolve', () => {
    expect(check({
      'index.html': `<main id="top"><a href="/work/toyota/">t</a><a href="/work/toyota">t</a><a href="#top">up</a>
        <a href="https://www.linkedin.com/in/x">li</a><img src="/img/a.webp" srcset="/img/a-640.webp 640w, /img/a.webp 1000w">
        <meta property="og:image" content="${origin}/og.png"><script type="application/ld+json">{"image":"${origin}/og.png"}</script></main>`,
    })).toEqual([]);
  });
  it('reads a meta content value as a link only when it is a URL, not a colour', () => {
    expect(check({ 'index.html': '<meta name="theme-color" content="#FAF7F2"><meta name="description" content="/ not a path">' })).toEqual([]);
  });
  it('flags a missing page, image or srcset entry', () => {
    expect(check({ 'index.html': '<a href="/work/nope/">x</a><img src="/img/b.webp" srcset="/img/a-640.webp 640w, /img/c.webp 1000w">' }))
      .toEqual(['/work/nope/', '/img/b.webp', '/img/c.webp']);
  });
  it('flags an anchor with no matching id, on this page or another', () => {
    expect(check({ 'index.html': '<a href="#nowhere">x</a><a href="/work/toyota/#gone">y</a>', 'work/toyota/index.html': '<h1 id="here">t</h1>' }))
      .toEqual(['#nowhere', '/work/toyota/#gone']);
  });
  it('flags missing files named in structured data, the sitemap and llms.txt', () => {
    expect(check({
      'index.html': `<script type="application/ld+json">{"image":"${origin}/james.jpg"}</script>`,
      'sitemap-0.xml': `<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/old/</loc></url></urlset>`,
      'llms.txt': `- [Home](${origin}/)\n- [Gone](${origin}/gone/)\n- [LinkedIn](https://www.linkedin.com/in/x)`,
    })).toEqual([`${origin}/james.jpg`, `${origin}/old/`, `${origin}/gone/`]);
  });
});
