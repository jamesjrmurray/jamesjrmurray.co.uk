import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '../../src/components/Header.astro';

describe('Header', () => {
  it('hides the Writing link when there is no writing to show', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Header, { props: { showWriting: false } });
    expect(html).not.toContain('/#writing');
    expect(html).toContain('/#work');
  });
  it('shows the Writing link when posts exist', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Header, { props: { showWriting: true } });
    expect(html).toContain('href="/#writing"');
  });
  it('shows the Talks link only when talks exist', async () => {
    const c = await AstroContainer.create();
    expect(await c.renderToString(Header, { props: { showWriting: false } })).not.toContain('/#talks');
    expect(await c.renderToString(Header, { props: { showWriting: false, showTalks: true } })).toContain('href="/#talks"');
  });
  it('shows the Projects link only when projects exist', async () => {
    const c = await AstroContainer.create();
    expect(await c.renderToString(Header, { props: { showWriting: false } })).not.toContain('/#projects');
    expect(await c.renderToString(Header, { props: { showWriting: false, showProjects: true } })).toContain('href="/#projects"');
  });
});
