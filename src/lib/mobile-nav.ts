// Progressive enhancement: without JS the nav is always visible and the button hidden (global.css).
export function initMobileNav(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const button = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const list = header?.querySelector<HTMLElement>('#site-nav');
  if (!header || !button || !list) return;

  header.dataset.menuReady = '';

  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    if (open) list.dataset.open = '';
    else delete list.dataset.open;
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
}
