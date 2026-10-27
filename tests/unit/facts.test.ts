import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { stats, work, projects, career, TESTS_CLAIM } from '../../src/content/site';
import { toyota } from '../../src/content/toyota';
import { thisWebsite } from '../../src/content/this-website';

const value = (label: RegExp) => stats.find((s) => label.test(s.label))!.value;

// Each headline fact is stated in several places; they must never drift apart.
describe('one fact, one value', () => {
  it('years of experience is worked out from 2005, when the engineering career starts', () => {
    expect(career.engineering.dates.startsWith('2005')).toBe(true);
    expect(value(/years/)).toBe(String(new Date().getFullYear() - 2005));
    expect(readFileSync('src/pages/index.astro', 'utf8')).not.toMatch(/\b\d{2} years\b/);
  });
  it('500 billion events matches the case study', () => {
    expect(value(/events/)).toBe('500B+');
    expect(toyota.highlights.find((h) => /events/.test(h.label))!.value).toBe('500B+');
    expect(JSON.stringify(toyota.sections)).toContain('more than 500 billion events');
  });
  it('two AI products matches the case study and career', () => {
    expect(value(/AI products/)).toBe('2');
    expect(toyota.highlights.find((h) => /AI products/.test(h.label))!.value).toBe('2');
    expect(toyota.teaser).toContain('two AI products');
    expect(career.roles.find((r) => r.org === toyota.org)!.note).toContain('two AI products');
  });
  it('£500K+ matches the Direct Line card', () => {
    expect(value(/revenue/)).toBe('£500K+');
    const dlg = work.find((w) => w.org === 'Direct Line Group')!;
    expect(dlg.title).toContain('£500K+');
    expect(dlg.outcome).toContain('more than £500K');
  });
  it('the Toyota dates match the career list', () => {
    expect(career.roles.find((r) => r.org === toyota.org)!.dates).toBe(toyota.years);
  });
  // Whether the claim is still true is checked by scripts/check-test-count.mjs, which asks the test runners.
  it('the test count is one claim, used on the card and the write-up', () => {
    expect(TESTS_CLAIM).toMatch(/^\d+\+$/);
    expect(projects[0].tags).toContain(`${TESTS_CLAIM} tests`);
    expect(thisWebsite.highlights.find((h) => /tests/.test(h.label))!.value).toBe(TESTS_CLAIM);
  });
});

// James, 2026-10-27: Innovate UK grants backed the tumble dryer work; the blockchain project was the
// joint venture with British Gas (also Innovate UK supported).
describe('Verv card says who backed what', () => {
  const verv = work.find((w) => w.org === 'Verv')!;
  it('credits Innovate UK grants for the tumble dryer work, and not British Gas', () => {
    expect(verv.outcome).toMatch(/tumble dryer/);
    expect(verv.outcome).toMatch(/Innovate UK grants/);
    expect(verv.outcome).not.toMatch(/British Gas/);
  });
  it('puts the British Gas joint venture with the blockchain project', () => {
    expect(verv.aside).toMatch(/blockchain energy trading, a joint venture with British Gas/);
    expect(verv.aside).toMatch(/Innovate UK/);
    expect(verv.aside).toMatch(/founding contributor to Energy Web\.$/);
  });
});
