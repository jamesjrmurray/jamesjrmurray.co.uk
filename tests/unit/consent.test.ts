import { describe, it, expect } from 'vitest';
import { readConsent, writeConsent, CONSENT_KEY } from '../../src/lib/consent';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};
const throwing = {
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('blocked'); },
};

describe('consent storage', () => {
  it('is null when nothing stored', () => expect(readConsent(memory())).toBeNull());
  it('round-trips granted and denied', () => {
    const s = memory();
    writeConsent(s, 'granted'); expect(readConsent(s)).toBe('granted');
    writeConsent(s, 'denied'); expect(readConsent(s)).toBe('denied');
    expect(s.m.get(CONSENT_KEY)).toBe('denied');
  });
  it('treats unknown stored values as no decision', () => {
    const s = memory(); s.setItem(CONSENT_KEY, 'maybe');
    expect(readConsent(s)).toBeNull();
  });
  it('never throws when storage is blocked or missing', () => {
    expect(readConsent(throwing)).toBeNull();
    expect(() => writeConsent(throwing, 'granted')).not.toThrow();
    expect(readConsent(undefined)).toBeNull();
    expect(() => writeConsent(undefined, 'denied')).not.toThrow();
  });
});
