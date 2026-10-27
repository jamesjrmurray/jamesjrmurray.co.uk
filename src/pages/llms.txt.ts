import type { APIRoute } from 'astro';
import { github, hero, posts, projects, stats, talks } from '../content/site';
import { latestPosts } from '../lib/posts';
import { latestTalks } from '../lib/talks';
import { thisWebsite } from '../content/this-website';
import { toyota } from '../content/toyota';

export const GET: APIRoute = ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  // Sections listed in homepage order, and only when they have something in them.
  const sections = ['case study', 'selected work', projects.length && 'projects', latestPosts(posts).length && 'writing', latestTalks(talks).length && 'talks', 'about', 'career', 'contact'].filter(Boolean);
  const body = [
    '# James Murray',
    '',
    `> ${hero.summary}`,
    '',
    `Product leader for AI and data, based in Kent, UK. Experience: ${hero.employers.join(', ')}.`,
    '',
    '## Highlights',
    ...stats.map((s) => `- ${s.value} ${s.label}`),
    '',
    '## Pages',
    `- [Home](${url('/')}): ${sections.join(', ')}`,
    `- [${toyota.title}](${url('/work/toyota/')}): case study, ${toyota.org}`,
    `- [${thisWebsite.title}](${url('/work/this-website/')}): project, how this site was built with Claude Code`,
    '',
    ...(latestTalks(talks).length ? ['## Talks', ...latestTalks(talks).map((t) => `- [${t.title}](${t.url}): ${t.event}`), ''] : []),
    '## Elsewhere',
    '- [LinkedIn](https://www.linkedin.com/in/jamesjrmurray)',
    `- [GitHub](${github}): including the code for this site`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
