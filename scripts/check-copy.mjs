import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { findViolations } from './copy-rules.mjs';
import { EXTRA_SOURCES } from './check-copy-sources.mjs';

const ROOT = 'dist';
const EXTS = new Set(['.html', '.txt', '.xml']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(p))) yield p;
  }
}

let failures = 0;
// The CSP (infra/site.yml) has no 'unsafe-inline' for scripts, so an inline script would silently not run.
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/;
for await (const file of walk(ROOT)) {
  const text = await readFile(file, 'utf8');
  for (const v of findViolations(text)) {
    console.error(`${file}: ${v.rule} "${v.match}"`);
    failures++;
  }
  if (file.endsWith('.html') && INLINE_SCRIPT.test(text)) {
    console.error(`${file}: inline script (blocked by the CSP) "${text.match(INLINE_SCRIPT)[0]}"`);
    failures++;
  }
}
for (const file of EXTRA_SOURCES) {
  for (const v of findViolations(await readFile(file, 'utf8'))) {
    console.error(`${file}: ${v.rule} "${v.match}"`);
    failures++;
  }
}
if (failures) {
  console.error(`\ncheck-copy: ${failures} violation(s).`);
  process.exit(1);
}
console.log('check-copy: clean.');
