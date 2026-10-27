// GA4 events. gtag exists only after the visitor accepts (see consent-ui.ts and ga.ts); until then,
// and on sites without a GA ID, every call is a no-op and nothing leaves the browser.
export const EVENTS = [
  'cv_download', 'linkedin_click',
  'case_study_open', 'case_study_read', 'post_click', 'talk_click', 'project_open', 'github_click', 'link_click', 'button_click', 'nav_click', 'section_view', 'scroll_depth', 'page_not_found',
] as const;
export type EventName = (typeof EVENTS)[number];
type Params = Record<string, string | number>;

export function trackEvent(name: EventName, params: Params = {}): void {
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', name, params);
}

// <a data-track="linkedin_click" data-track-location="hero"> → { name, params: { location: 'hero' } }
export function eventFromElement(el: HTMLElement): { name: EventName; params: Params } | null {
  const name = el.dataset.track as EventName | undefined;
  if (!name || !EVENTS.includes(name)) return null;
  const params: Params = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key.startsWith('track') && key !== 'track' && value !== undefined) {
      params[key.slice(5, 6).toLowerCase() + key.slice(6)] = value;
    }
  }
  return { name, params };
}

// Catch-all for links and buttons with no data-track of their own, so every click is recorded.
// link_url and link_text match GA4's built-in dimensions; label and section match our custom ones.
export interface Clickable { tag: 'a' | 'button'; text: string; href?: string; section: string; pageHost: string }
export function genericClickEvent(c: Clickable): { name: EventName; params: Params } {
  const label = c.text.replace(/\s+/g, ' ').trim().slice(0, 100);
  if (c.tag === 'button') return { name: 'button_click', params: { label, section: c.section } };
  let outbound = 'no';
  try { outbound = new URL(c.href ?? '', `https://${c.pageHost}`).host === c.pageHost ? 'no' : 'yes'; } catch { /* keep 'no' */ }
  return { name: 'link_click', params: { label, link_text: label, link_url: c.href ?? '', section: c.section, outbound } };
}

const MILESTONES = [50, 90];
export function scrollMilestones(percent: number, fired: Set<number>): number[] {
  const hit = MILESTONES.filter((m) => percent >= m && !fired.has(m));
  hit.forEach((m) => fired.add(m));
  return hit;
}

// A case study counts as read at 90% scroll or after a minute of the tab being visible, once per page.
export const READ_SECONDS = 60;
export function readTrigger(percent: number, visibleSeconds: number): 'scroll' | 'time' | null {
  if (percent >= 90) return 'scroll';
  if (visibleSeconds >= READ_SECONDS) return 'time';
  return null;
}

// Fires section_view once per [data-section] as it crosses the middle of the screen, which works for
// sections taller than the viewport too.
function trackSections(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-section]');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // Before consent there is no gtag: keep watching, so the view counts once the visitor accepts.
        if (typeof (window as unknown as { gtag?: unknown }).gtag !== 'function') continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        trackEvent('section_view', { section: el.dataset.section!, page: location.pathname });
      }
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

function trackCaseStudyRead(scrollPercent: () => number): void {
  if (!location.pathname.startsWith('/work/')) return;
  let visible = 0;
  let done = false;
  const check = () => {
    const trigger = done ? null : readTrigger(scrollPercent(), visible);
    if (!trigger) return;
    done = true;
    clearInterval(timer);
    trackEvent('case_study_read', { page: location.pathname, trigger });
  };
  const timer = setInterval(() => {
    if (document.visibilityState === 'visible') visible++;
    check();
  }, 1000);
  window.addEventListener('scroll', check, { passive: true });
}

export function initTracking(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-track]');
    const ev = el && eventFromElement(el);
    if (ev) return trackEvent(ev.name, ev.params);
    const hit = target.closest<HTMLElement>('a[href], button');
    if (!hit) return;
    const section = hit.closest<HTMLElement>('[data-section]')?.dataset.section
      ?? (hit.closest('header') ? 'header' : hit.closest('footer') ? 'footer' : hit.closest('[data-consent]') ? 'consent' : 'page');
    const generic = genericClickEvent({
      tag: hit.tagName === 'A' ? 'a' : 'button',
      text: hit.getAttribute('aria-label') || hit.textContent || '',
      href: hit.getAttribute('href') ?? undefined,
      section,
      pageHost: location.host,
    });
    trackEvent(generic.name, generic.params);
  });
  const scrollPercent = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max <= 0 ? 0 : Math.round((window.scrollY / max) * 100);
  };
  const fired = new Set<number>();
  const onScroll = () => {
    for (const m of scrollMilestones(scrollPercent(), fired)) {
      trackEvent('scroll_depth', { percent: m, page: location.pathname });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  trackSections();
  trackCaseStudyRead(scrollPercent);
}
