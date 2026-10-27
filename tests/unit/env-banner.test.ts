import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import EnvBanner from '../../src/components/EnvBanner.astro';

describe('EnvBanner', () => {
  it('labels dev and staging with distinct colours', async () => {
    const c = await AstroContainer.create();
    const dev = await c.renderToString(EnvBanner, { props: { env: 'dev' } });
    const stage = await c.renderToString(EnvBanner, { props: { env: 'stage' } });
    expect(dev).toContain('DEV environment');
    expect(dev).toContain('#F5B700');
    expect(stage).toContain('STAGING environment');
    expect(stage).toContain('#6B3FA0');
  });

  it('renders nothing on prod, local or test', async () => {
    const c = await AstroContainer.create();
    for (const env of ['prod', 'local', 'test', undefined]) {
      const html = await c.renderToString(EnvBanner, { props: { env } });
      expect(html).not.toContain('data-env-banner');
    }
  });
});
