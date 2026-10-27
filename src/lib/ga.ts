type GtagWindow = Window & { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };

// GA loads only after the visitor accepts (consent-ui.ts), so before a choice, or after Reject,
// nothing is sent to Google. Consent Mode signals are still set: analytics granted once accepted,
// ads always denied (this site runs no advertising).
export function consentState(granted: boolean): Record<string, 'granted' | 'denied'> {
  return {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
}

export function loadGA(id: string, granted: boolean): void {
  if (document.querySelector('script[data-ga]')) return;
  const w = window as unknown as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // gtag must push the `arguments` object, not an array.
  w.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  // The consent default must be queued before config, or the first hit ignores it.
  w.gtag('consent', 'default', consentState(granted));
  w.gtag('set', 'ads_data_redaction', true);
  w.gtag('js', new Date());
  w.gtag('config', id);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  s.dataset.ga = '';
  document.head.appendChild(s);
}

export function updateConsent(granted: boolean): void {
  const w = window as unknown as Partial<GtagWindow>;
  w.gtag?.('consent', 'update', consentState(granted));
}

export function clearGaCookies(): void {
  const host = location.hostname;
  const domains = ['', host, `.${host.replace(/^www\./, '')}`];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}
