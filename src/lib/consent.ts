export type Consent = 'granted' | 'denied' | null;
export const CONSENT_KEY = 'jm-consent-v1';

export function safeStorage(): Storage | undefined {
  try {
    const s = window.localStorage;
    s.getItem(CONSENT_KEY);
    return s;
  } catch {
    return undefined;
  }
}

export function readConsent(store: Pick<Storage, 'getItem'> | undefined): Consent {
  try {
    const v = store?.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(store: Pick<Storage, 'setItem'> | undefined, value: 'granted' | 'denied'): void {
  try {
    store?.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked: the choice lasts for this page view only */
  }
}
