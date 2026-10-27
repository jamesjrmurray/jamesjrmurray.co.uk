import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { monthYear, dayMonthYear } from '../../src/lib/dates';

describe('date labels', () => {
  // Node's en-GB short months say "Sept" (and may change with its ICU data); the site uses three letters.
  it('use three-letter months, September included', () => {
    expect(monthYear('2025-09-10')).toBe('Sep 2025');
    expect(dayMonthYear('2025-09-10')).toBe('10 Sep 2025');
    const months = Array.from({ length: 12 }, (_, i) => monthYear(`2025-${String(i + 1).padStart(2, '0')}-01`).split(' ')[0]);
    expect(months).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
  });
  it('do not shift a day in any time zone', () => {
    expect(dayMonthYear('2025-11-25')).toBe('25 Nov 2025');
    expect(dayMonthYear('2025-01-01')).toBe('1 Jan 2025');
  });
  it('are the only date formatting the talks and posts use', () => {
    for (const f of ['src/components/Talks.astro', 'src/components/Posts.astro']) expect(readFileSync(f, 'utf8'), f).not.toContain('toLocaleDateString');
  });
});
