import { describe, it, expect } from 'vitest';
import * as site from '../../src/content/site';
import { toyota } from '../../src/content/toyota';
import { isValidPost } from '../../src/lib/posts';

describe('site content', () => {
  it('has exactly four stats', () => expect(site.stats).toHaveLength(4));
  it('has three selected work items', () => expect(site.work).toHaveLength(3));
  it('lists eight product roles', () => expect(site.career.roles).toHaveLength(8));
  it('has no gap between product roles', () => {
    const r = [...site.career.roles].reverse();
    r.slice(1).forEach((role, i) => expect(role.dates.slice(0, 4)).toBe(r[i].dates.slice(5, 9)));
  });
  it('every configured post is valid', () => site.posts.forEach((p) => expect(isValidPost(p)).toBe(true)));
  it('never says the Direct Line figure is annual (unconfirmed)', () => {
    expect(JSON.stringify(site)).not.toMatch(/annual/i);
  });
});

describe('toyota case study', () => {
  it('has three numbered decisions, each with a trade-off', () => {
    const decisions = toyota.sections.filter((s) => s.number);
    expect(decisions.map((d) => d.number)).toEqual([1, 2, 3]);
    decisions.forEach((d) => expect(d.tradeOff).toBeTruthy());
  });
  it('invites a conversation for the detail', () => expect(toyota.ndaNote).toMatch(/get in touch/));
});

describe('this website project', async () => {
  const { thisWebsite } = await import('../../src/content/this-website');
  it('has one project card pointing at the write-up and the public repo', () => {
    expect(site.projects).toHaveLength(1);
    expect(site.projects[0].pageUrl).toBe('/work/this-website/');
    expect(site.projects[0].codeUrl).toBe('https://github.com/jamesjrmurray/jamesjrmurray.co.uk');
  });
  it('has the five write-up sections in order', () => {
    expect(thisWebsite.sections.map((s) => s.heading)).toEqual(['The brief', 'How we worked', 'Key decisions', 'Security', 'Architecture']);
  });
  it('has James\'s three lessons', () => expect(thisWebsite.lessons).toHaveLength(3));
  it('uses no em dashes', () => {
    expect(JSON.stringify(site.projects)).not.toContain('—');
    expect(JSON.stringify(thisWebsite)).not.toContain('—');
  });
});
