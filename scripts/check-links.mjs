// Checks the built site (dist/) for links that lead nowhere: pages, images, srcset copies, #anchors,
// social images, structured data, sitemap entries and llms.txt links. External links are not fetched.
// Run after a build:   node scripts/check-links.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const ATTR = /\s(?:href|src)="([^"]*)"/g;
// <meta content> holds social image URLs, but also colours and prose: only absolute URLs count.
const META_URL = /\scontent="(https?:[^"\s]*)"/g;
const SRCSET = /\ssrcset="([^"]*)"/g;
const LD = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const LOC = /<loc>([^<]*)<\/loc>/g;
const MD_LINK = /\]\(([^)\s]+)\)/g;

function linksIn(file, text, origin) {
  const found = [];
  const add = (v) => { if (v) found.push(v.trim()); };
  if (file.endsWith('.html')) {
    for (const m of text.matchAll(ATTR)) if (/^(\/|#|https?:)/.test(m[1])) add(m[1]);
    for (const m of text.matchAll(META_URL)) add(m[1]);
    for (const m of text.matchAll(SRCSET)) for (const part of m[1].split(',')) add(part.trim().split(/\s+/)[0]);
    for (const m of text.matchAll(LD)) for (const s of JSON.stringify(JSON.parse(m[1])).match(/"https?:[^"]*"/g) ?? []) add(JSON.parse(s));
  } else if (file.endsWith('.xml')) {
    for (const m of text.matchAll(LOC)) add(m[1]);
  } else if (file.endsWith('.txt')) {
    for (const m of text.matchAll(MD_LINK)) add(m[1]);
  }
  return [...new Set(found)].filter((l) => l.startsWith('/') && !l.startsWith('//') || l.startsWith('#') || l.startsWith(`${origin}/`) || l === origin);
}

// '/work/toyota' and '/work/toyota/' are both served from work/toyota/index.html (infra/viewer-request.js).
function fileFor(path) {
  const p = decodeURI(path).replace(/^\//, '');
  if (p === '' || p.endsWith('/')) return `${p}index.html`;
  return extname(p) ? p : `${p}/index.html`;
}

export function findBrokenLinks({ pages, files, origin }) {
  const broken = [];
  for (const [file, text] of pages) {
    for (const link of linksIn(file, text, origin)) {
      const url = new URL(link, `${origin}/${file}`);
      const target = link.startsWith('#') ? file : fileFor(url.pathname);
      if (!files.has(target)) { broken.push({ file, link, reason: 'no such file' }); continue; }
      const id = decodeURIComponent(url.hash.slice(1));
      if (id && target.endsWith('.html') && !new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(pages.get(target) ?? '')) {
        broken.push({ file, link, reason: 'no element with that id' });
      }
    }
  }
  return broken;
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ROOT = 'dist';
  const files = new Set();
  const pages = new Map();
  for await (const p of walk(ROOT)) {
    const rel = relative(ROOT, p);
    files.add(rel);
    if (['.html', '.xml', '.txt'].includes(extname(p))) pages.set(rel, await readFile(p, 'utf8'));
  }
  // The site's own address, as the build wrote it into the homepage's canonical link.
  const origin = new URL(pages.get('index.html').match(/rel="canonical" href="([^"]+)"/)[1]).origin;
  const broken = findBrokenLinks({ pages, files, origin });
  for (const b of broken) console.error(`${b.file}: ${b.link} (${b.reason})`);
  if (broken.length) { console.error(`\ncheck-links: ${broken.length} broken link(s).`); process.exit(1); }
  console.log(`check-links: ${pages.size} files, all links resolve.`);
}
