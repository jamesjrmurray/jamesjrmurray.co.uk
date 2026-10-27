import { describe, it, expect } from 'vitest';
import { findViolations } from '../../scripts/copy-rules.mjs';

const rules = (t: string) => findViolations(t).map((v: { rule: string }) => v.rule);

describe('findViolations', () => {
  it('passes clean copy', () => expect(rules("Always happy to talk AI, data and product leadership.")).toEqual([]));
  it.each([
    'Available for senior product roles',
    'Open to new opportunities',
    'Currently seeking a new role',
    'I am job hunting',
  ])('flags availability language: %s', (t) => expect(rules(t)).toContain('availability'));
  it('flags a UK mobile number', () => expect(rules('Call +44 7700 900123')).toContain('phone'));
  it('flags a UK mobile in 07 form', () => expect(rules('07700 900123')).toContain('phone'));
  it('flags the private email', () => expect(rules('mailto:owner@example.com')).toContain('email'));
  it('flags placeholders', () => expect(rules('[TALK TITLE] — Data Decoded')).toContain('placeholder'));
  // The site uses curly apostrophes (’) throughout; Astro writes a straight one as &#39;.
  it('flags a straight apostrophe, raw or escaped', () => {
    expect(rules("I've worked")).toContain('straight-apostrophe');
    expect(rules('Engineer&#39;s instinct')).toContain('straight-apostrophe');
    expect(rules('Engineer’s instinct')).not.toContain('straight-apostrophe');
  });
  it('flags an annual claim on the £500K figure', () => expect(rules('£500K+ annual revenue')).toContain('annual-claim'));
  it.each([
    'Currently available',
    'Available to start in January',
    'Seeking new opportunities',
    'seeking my next role',
    'Looking for new opportunities',
    'open to a new challenge',
    '#OpenToWork',
    'Open to <em>new roles</em>',
  ])('flags looser availability phrasing: %s', (t) => expect(rules(t)).toContain('availability'));
  it('flags availability hidden in a meta attribute', () =>
    expect(rules('<meta name="description" content="Product leader, available now">')).toContain('availability'));
  it.each(['annual revenue of £500K+', '£500K a year'])('flags annual framing: %s', (t) =>
    expect(rules(t)).toContain('annual-claim'));
  it.each(['07700-900-123', '+44 (0)7700 900123'])('flags phone formats: %s', (t) => expect(rules(t)).toContain('phone'));
  it('does not flag ordinary numbers', () => expect(rules('500B+ events, 31 markets, 2016 – 2017')).toEqual([]));
});

describe('check-copy sources', () => {
  it('also scans the OG card source, whose text is baked into og.png', async () => {
    const { EXTRA_SOURCES } = await import('../../scripts/check-copy-sources.mjs');
    expect(EXTRA_SOURCES).toContain('scripts/og-card.html');
  });
});
