import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as site from '../../src/content/site';
import { toyota } from '../../src/content/toyota';
import { thisWebsite } from '../../src/content/this-website';
import { privacy as privacyCopy } from '../../src/content/privacy';

// Fixes from the 2026-10-26 copy review; each line guards one finding.
const all = JSON.stringify({ site, toyota, thisWebsite });
const file = (p: string) => readFileSync(p, 'utf8');

describe('copy review fixes', () => {
  it('describes analytics as consent-first (it now loads only after Accept), and claims no penetration test', () => {
    expect(all).toContain('Google Analytics runs only if you accept');
    expect(all).not.toMatch(/penetration test/);
  });
  it('banner does not claim nothing else is tracked', () => expect(file('src/components/ConsentBanner.astro')).not.toContain('Nothing else is tracked'));
  it('Toyota closes with "What I learned"', () => {
    expect(file('src/pages/work/toyota.astro')).toContain('What I learned');
    expect(file('src/pages/work/toyota.astro')).not.toContain("What I'd do differently");
  });
  it('the £500K is worth something, and the project card says what Claude Code reviewed', () => {
    expect(all).toContain('worth more than £500K');
    expect(site.projects[0].outcome).toMatch(/reviewed it\.$/);
  });
  it('no sentence fragments, jargon or repeats the review flagged', () => {
    expect(all).not.toMatch(/Innovate UK funded|Most product leaders|underneath, and|Before that, five years|privacy team and DPO|eCommerce|TRHITC|father/);
    expect(toyota.highlights.map((h) => h.value)).not.toContain('PB');
    expect(all).not.toContain('Raw vehicle data was enriched');
  });
  it('dates use one style (no spaces around the dash)', () => expect(all).not.toMatch(/\d{4} – (\d{4}|now)/));
  it('selected work is newest first', () => {
    const starts = site.work.map((w) => Number(w.years.slice(0, 4)));
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
  });
  it('one card per talk, with a short event label', () => {
    const titles = site.talks.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
    site.talks.forEach((t) => expect(t.event.length).toBeLessThanOrEqual(45));
  });
  it('village is not in machine-readable data', () => {
    expect(file('src/pages/llms.txt.ts')).not.toContain('Lenham');
    expect(file('src/components/Seo.astro')).not.toContain('Lenham');
  });
});

// Fixes from the second, line-by-line review (2026-10-26).
describe('teacher review fixes', () => {
  const t = JSON.stringify({ site, toyota, thisWebsite });
  it('fixes the grammar slips', () => {
    expect(t).toContain('hard to attack');
    expect(toyota.sections.at(-1)!.paragraphs[0]).toMatch(/^Two AI products now run in production/);
    expect(site.about.paragraphs[2]).toContain('Lenham, Kent; committee member');
    expect(t).toContain('runs only if you accept');
    expect(t).toMatch(/lakehouse handling more than 500 billion events/);
    expect(toyota.teaser).toContain('Three decisions (lakehouse first, privacy by design, governance before models) took');
    expect(site.work.find((w) => w.org === 'RS Components')!.outcome).toMatch(/^We rebuilt checkout,/);
    expect(t).toContain('founding contributor to Energy Web.');
    expect(t).toContain('E-commerce API for an Australian insurer');
    expect(toyota.lesson).toContain('I found that out the hard way');
    expect(t).toContain('lives in the GitHub repo');
    expect(site.hero.summary).toContain('how the technology underneath works');
    expect(site.hero.eyebrow).toBe('Product leader for AI and data');
  });
  it('keeps punctuation and numbers consistent', () => {
    expect(t).not.toContain('inconsistently governed, and slow');
    expect(t).not.toMatch(/\b2 AI products to production/);
    expect(toyota.highlights).toContainEqual({ value: 'Petabyte-scale', label: 'lakehouse' });
    expect(site.talks[0].dateLabel).toBe('Nov–Dec 2025');
    thisWebsite.diagrams.forEach((d) => expect(d.alt).toMatch(/^C\d · [A-Z]/));
    expect(file('src/pages/404.astro')).toContain('← Back to home');
    expect(file('src/components/ConsentBanner.astro')).toContain('It runs only if you accept');
  });
  it('career titles match LinkedIn', () => {
    const byOrg = Object.fromEntries(site.career.roles.map((r) => [r.org, r.title]));
    expect(byOrg['RDT']).toBe('Product Owner (API)');
    expect(byOrg['Direct Line Group']).toBe('Senior Digital Product Manager (E-commerce)');
  });
  // Measured 2026-10-26 from James's message timestamps: ~4 h of his time from brief (15 Oct) to launch
  // (23 Oct); elapsed time was 8 days, so the claim is about his effort, not the calendar.
  it("effort claim is about James's time, which the record supports", () => {
    expect(site.projects[0].outcome).toContain('less than a working day of my time');
    expect(thisWebsite.highlights[0]).toEqual({ value: '<1 day', label: 'of my time, brief to live' });
    expect(JSON.stringify(site) + JSON.stringify(thisWebsite)).not.toMatch(/48 hours|<48h/);
  });
});

// QA copy review 19-37 (2026-10-27); James agreed to the suggestions. 27, 28 and 37 wait on his facts.
describe('QA copy review', () => {
  const t = JSON.stringify({ site, toyota, thisWebsite });
  const privacy = () => JSON.stringify(privacyCopy);
  it('19: the About section does not repeat the hero', () => {
    expect(site.about.paragraphs[0]).not.toContain('systems engineer');
    expect(site.about.paragraphs[0]).not.toMatch(/systems.*systems/);
  });
  it('20: apostrophes are curly everywhere', () => expect(t).not.toMatch(/[A-Za-z]'[A-Za-z]/));
  it('21: links back home point back', () => {
    for (const p of ['src/pages/404.astro', 'src/pages/work/toyota.astro', 'src/pages/work/this-website.astro']) expect(file(p), p).not.toContain('Back to home →');
  });
  it('22: lessons are not wrapped in quote marks on one page and bare on the other', () => expect(file('src/pages/work/toyota.astro')).not.toContain('“{toyota.lesson}”'));
  it('23: no "AI pair"', () => expect(t).not.toContain('AI pair'));
  it('24: the code claim is exact', () => {
    expect(thisWebsite.ndaNote).not.toMatch(/^All the code/);
    expect(thisWebsite.ndaNote).toContain('with private details removed');
  });
  it('25/26: the privacy notice does not contradict itself or overclaim deletion', () => {
    expect(privacy()).not.toContain('never sell or share data');
    expect(privacy()).toContain('never sell your data or share it with anyone else');
    expect(privacy()).not.toContain('kept for 14 months, then deleted');
  });
  it('28: the privacy work names both UK and EU GDPR (James, 2026-10-27)', () => expect(JSON.stringify(toyota)).toContain('working to UK and EU GDPR and the Data Protection Act 2018'));
  it('29: "across the EU" once on the Toyota page, and the outcome is not the teaser again', () => {
    expect((JSON.stringify(toyota).match(/across the EU/g) ?? []).length).toBe(1);
    expect(toyota.sections.at(-1)!.paragraphs[0]).not.toContain('from concept to production');
  });
  it('31: the engineering line is a job title like the rest', () => expect(site.career.engineering.title).toBe('Systems Engineer'));
  it('32: the Verv card is full sentences', () => expect(site.work.find((w) => w.org === 'Verv')!.outcome).toMatch(/^We built/));
  it('33: a talk given twice names its events once (in the links)', () => expect(file('src/components/Talks.astro')).toMatch(/t\.events \? t\.dateLabel/));
  it('34: dates use short months, privacy notice included', () => expect(privacy()).not.toMatch(/\d (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/));
  it('35: clicks are not claimed to show reading', () => expect(t).not.toContain('what people actually read'));
});
