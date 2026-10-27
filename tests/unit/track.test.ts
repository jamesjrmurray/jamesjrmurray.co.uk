import { describe, it, expect, afterEach } from 'vitest';
import { trackEvent, eventFromElement, genericClickEvent, scrollMilestones, readTrigger, READ_SECONDS } from '../../src/lib/track';
import { consentState } from '../../src/lib/ga';

afterEach(() => { delete (globalThis as any).window; });

describe('trackEvent', () => {
  it('does nothing when GA is not loaded (no GA ID)', () => {
    (globalThis as any).window = {};
    expect(() => trackEvent('linkedin_click', { location: 'hero' })).not.toThrow();
  });
  it('sends to gtag once GA is loaded', () => {
    const calls: unknown[][] = [];
    (globalThis as any).window = { gtag: (...a: unknown[]) => calls.push(a) };
    trackEvent('cv_download');
    expect(calls).toEqual([['event', 'cv_download', {}]]);
  });
});

describe('eventFromElement', () => {
  const el = (attrs: Record<string, string>) => ({ dataset: attrs }) as unknown as HTMLElement;
  it('reads the event name and its parameters from data-track attributes', () => {
    expect(eventFromElement(el({ track: 'linkedin_click', trackLocation: 'hero' }))).toEqual({
      name: 'linkedin_click', params: { location: 'hero' },
    });
  });
  it('ignores elements without a known event name', () => {
    expect(eventFromElement(el({ track: 'something_else' }))).toBeNull();
    expect(eventFromElement(el({}))).toBeNull();
  });
});

describe('scrollMilestones', () => {
  it('returns newly reached 50 and 90 percent marks only once', () => {
    const fired = new Set<number>();
    expect(scrollMilestones(55, fired)).toEqual([50]);
    expect(scrollMilestones(60, fired)).toEqual([]);
    expect(scrollMilestones(95, fired)).toEqual([90]);
  });
});

describe('readTrigger', () => {
  it('counts a case study as read at 90% scroll or after a minute visible', () => {
    expect(readTrigger(50, 10)).toBeNull();
    expect(readTrigger(92, 10)).toBe('scroll');
    expect(readTrigger(20, READ_SECONDS)).toBe('time');
  });
});

describe('consentState', () => {
  it('only ever grants analytics storage; ads signals stay denied', () => {
    expect(consentState(false)).toEqual({
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
    expect(consentState(true)).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });
  });
});

describe('genericClickEvent', () => {
  const host = 'jamesjrmurray.co.uk';
  it('records a button with its label and section', () => {
    expect(genericClickEvent({ tag: 'button', text: '  Send\n message ', section: 'contact', pageHost: host }))
      .toEqual({ name: 'button_click', params: { label: 'Send message', section: 'contact' } });
  });
  it('records an internal link with its URL', () => {
    const ev = genericClickEvent({ tag: 'a', text: "Let's talk →", href: '/#contact', section: 'hero', pageHost: host });
    expect(ev.name).toBe('link_click');
    expect(ev.params).toMatchObject({ label: "Let's talk →", link_url: '/#contact', section: 'hero', outbound: 'no' });
  });
  it('marks links to other sites as outbound', () => {
    expect(genericClickEvent({ tag: 'a', text: 'x', href: 'https://example.com/', section: 'page', pageHost: host }).params.outbound).toBe('yes');
  });
  it('keeps labels short', () => {
    expect(String(genericClickEvent({ tag: 'button', text: 'a'.repeat(300), section: 'page', pageHost: host }).params.label)).toHaveLength(100);
  });
});
