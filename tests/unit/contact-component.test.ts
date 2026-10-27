import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Contact from '../../src/components/Contact.astro';

describe('Contact component', () => {
  it('makes LinkedIn the way in, with GitHub alongside, and no form', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Contact, { props: { hasCv: false } });
    expect(html).not.toContain('<form');
    expect(html).toContain('linkedin.com/in/jamesjrmurray');
    expect(html).toMatch(/<a [^>]*href="https:\/\/github\.com\/jamesjrmurray"[^>]*data-track-location="contact"[^>]*>github\.com\/jamesjrmurray →<\/a>/);
  });
  it('shows the CV link only when the file exists', async () => {
    const c = await AstroContainer.create();
    expect(await c.renderToString(Contact, { props: { hasCv: false } })).not.toContain('Download CV');
    expect(await c.renderToString(Contact, { props: { hasCv: true } })).toContain('Download CV');
  });
});
