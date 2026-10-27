import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Projects from '../../src/components/Projects.astro';
import type { Project } from '../../src/content/types';

const p = (extra: Partial<Project> = {}): Project => ({
  label: 'Project · 2026', title: 'A project', outcome: 'An outcome', tags: ['Astro', 'AWS'], pageUrl: '/work/x/', ...extra,
});
const render = async (projects: Project[]) => (await AstroContainer.create()).renderToString(Projects, { props: { projects } });

describe('Projects component', () => {
  it('renders nothing when there are no projects', async () => expect(await render([])).not.toContain('id="projects"'));
  it('shows title, outcome and every tag', async () => {
    const html = await render([p()]);
    for (const t of ['A project', 'An outcome', 'Astro', 'AWS', 'Project · 2026']) expect(html).toContain(t);
  });
  it('links to the write-up and tracks the open', async () => {
    const html = await render([p()]);
    expect(html).toMatch(/<a [^>]*href="\/work\/x\/"[^>]*data-track="project_open"[^>]*>\s*Read how it was built →\s*<\/a>/);
  });
  it('hides the code link until the public repo exists', async () => expect(await render([p()])).not.toContain('Code on GitHub'));
  it('shows a tracked code link once codeUrl is set', async () => {
    const html = await render([p({ codeUrl: 'https://github.com/x/y' })]);
    expect(html).toMatch(/<a [^>]*href="https:\/\/github\.com\/x\/y"[^>]*data-track="github_click"[^>]*>\s*Code on GitHub →\s*<\/a>/);
  });
});
