import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Posts from '../../src/components/Posts.astro';
import type { Post } from '../../src/content/types';

const p = (title: string, date: string): Post => ({
  type: 'talk', title, summary: 'Summary', date, url: 'https://example.com/x', host: 'ProductTank Cardiff',
});

describe('Posts component', () => {
  it('renders nothing when there are no posts', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Posts, { props: { posts: [] } });
    expect(html).not.toContain('id="writing"');
  });
  it('renders the newest three, newest first', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Posts, {
      props: { posts: [p('A', '2025-10-01'), p('B', '2025-12-01'), p('C', '2025-11-25'), p('D', '2025-01-01')] },
    });
    expect(html).toContain('id="writing"');
    const order = ['B', 'C', 'A'].map((t) => html.indexOf(`>${t}<`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html).not.toContain('>D<');
  });
  it('links only the title, so the link name is short', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Posts, { props: { posts: [p('A talk', '2025-11-25')] } });
    const anchors = [...html.matchAll(/<a [^>]*href="https:\/\/example\.com\/x"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
    expect(anchors).toEqual(['A talk']);
  });
});
