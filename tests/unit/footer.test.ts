import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../../src/components/Footer.astro';

describe('Footer', () => {
  it('matches the spec: name, year, LinkedIn and GitHub', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Footer);
    expect(html).toContain('James Murray');
    expect(html).toContain('linkedin.com/in/jamesjrmurray');
    expect(html).toMatch(/<a [^>]*href="https:\/\/github\.com\/jamesjrmurray"[^>]*data-track="github_click"[^>]*data-track-location="footer"[^>]*>GitHub<\/a>/);
    expect(html).not.toContain('Lenham');
  });
});
