import type { APIRoute } from 'astro';

// Search engines and AI assistants named explicitly so the intent is unambiguous (all allowed in prod).
const CRAWLERS = ['Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot'];

export const GET: APIRoute = ({ site }) => {
  const isProd = process.env.SITE_ENV === 'prod';
  const body = isProd
    ? [
        ...CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${new URL('/sitemap-index.xml', site).href}`,
        '',
      ].join('\n')
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
