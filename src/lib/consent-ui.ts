import { readConsent, writeConsent, safeStorage } from './consent';
import { loadGA, updateConsent, clearGaCookies } from './ga';

export function initConsent(): void {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner) return;
  const id = banner.dataset.gaId ?? '';
  const store = safeStorage();
  const accept = banner.querySelector<HTMLElement>('[data-consent-accept]')!;
  const reject = banner.querySelector<HTMLElement>('[data-consent-reject]')!;
  let session = readConsent(store);
  let opener: HTMLElement | null = null;

  // Nothing from Google loads until the visitor accepts (see ga.ts).
  if (session === 'granted') loadGA(id, true);
  if (session === 'denied') clearGaCookies();
  else if (session === null) banner.hidden = false;

  // Return focus to whatever opened the banner, or to the main content on a first visit.
  const close = () => {
    banner.hidden = true;
    const target = opener ?? document.getElementById('main');
    opener = null;
    target?.focus();
  };

  accept.addEventListener('click', () => {
    session = 'granted';
    writeConsent(store, 'granted');
    close();
    loadGA(id, true);
  });

  reject.addEventListener('click', () => {
    const wasGranted = session === 'granted';
    session = 'denied';
    writeConsent(store, 'denied');
    updateConsent(false);
    if (wasGranted) {
      clearGaCookies();
      location.reload();
      return;
    }
    close();
  });

  // Shown only once this script runs: without JavaScript the button could do nothing.
  document.querySelectorAll<HTMLElement>('[data-consent-open]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => {
      opener = b;
      banner.hidden = false;
      accept.focus();
    });
  });

  // Escape only dismisses a banner the visitor reopened; a first visit still needs a choice.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !banner.hidden && opener) close();
  });
}
