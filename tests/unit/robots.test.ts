import { describe, it, expect, afterEach } from 'vitest';
import { GET } from '../../src/pages/robots.txt';

const site = new URL('https://jamesjrmurray.co.uk');
const body = async () => (await (GET as any)({ site })).text();

describe('robots.txt', () => {
  afterEach(() => { delete process.env.SITE_ENV; });
  it('blocks everything outside prod', async () => {
    process.env.SITE_ENV = 'dev';
    expect(await body()).toContain('Disallow: /');
  });
  it('in prod, explicitly welcomes search and AI crawlers and lists the sitemap', async () => {
    process.env.SITE_ENV = 'prod';
    const b = await body();
    for (const bot of ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(b).toContain(`User-agent: ${bot}`);
    }
    expect(b).not.toContain('Disallow: /\n');
    expect(b).toContain('Sitemap: https://jamesjrmurray.co.uk/sitemap-index.xml');
  });
});
