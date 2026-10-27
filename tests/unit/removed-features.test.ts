import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { EVENTS } from '../../src/lib/track';
import { thisWebsite } from '../../src/content/this-website';

const read = (f: string) => readFileSync(f, 'utf8');

// James chose LinkedIn as the only contact route (2026-10-26), and the privacy notice says there are no
// forms. Leftover form wiring would contradict both, so none of it may come back by accident.
describe('no contact form', () => {
  it('ships no form code or Formspree settings', () => {
    expect(existsSync('src/lib/contact-form.ts')).toBe(false);
    expect(existsSync('src/lib/contact.ts')).toBe(false);
    // The public copy of the repo leaves out the deploy workflow, so only check the files that are here.
    for (const f of ['src/components/Contact.astro', 'src/pages/index.astro', 'playwright.config.ts', '.github/workflows/deploy-env.yml', '.env.example', 'README.md'].filter((f) => existsSync(f))) {
      expect(read(f), f).not.toMatch(/formspree/i);
    }
  });

  it('the security policy allows no form posts and no Formspree connections', () => {
    const yml = read('infra/site.yml');
    expect(yml).not.toMatch(/formspree/i);
    expect(yml).toContain("form-action 'none'");
  });

  it('analytics has no contact-form events', () => {
    for (const e of ['contact_submit', 'contact_form_start', 'contact_form_error']) expect(EVENTS).not.toContain(e);
  });

  it('the architecture diagrams and their descriptions show only what is built', () => {
    expect(existsSync('docs/architecture/c4-contact-form.puml')).toBe(false);
    for (const f of readdirSync('docs/architecture').filter((f) => f.endsWith('.puml') || f.endsWith('.md'))) {
      expect(read(`docs/architecture/${f}`), f).not.toMatch(/formspree/i);
    }
    for (const d of thisWebsite.diagrams) expect(d.alt).not.toMatch(/formspree/i);
  });
});

// The Google sign-in stack (jm-preview-auth) was deleted on 2026-10-26; dev and staging keep only the
// optional password prompt.
describe('no Google sign-in', () => {
  it('has no login service code or stack', () => {
    for (const f of ['infra/auth-login.cjs', 'infra/preview-auth.yml', 'infra/deploy-auth.sh']) expect(existsSync(f), f).toBe(false);
  });

  it('the edge function, site stack and deploy script carry no sign-in wiring', () => {
    expect(read('infra/viewer-request.js')).not.toMatch(/COOKIE_KEY|\/_auth\/|crypto/);
    expect(read('infra/site.yml')).not.toMatch(/Login|AuthDomain|CookieKey|AllowedEmails/);
    expect(read('infra/deploy-stack.sh')).not.toMatch(/jm-preview-auth|COOKIE_KEY|LOGIN_CODE/);
    expect(read('scripts/smoke.sh')).not.toContain('/_auth/');
  });
});

// C1 and C2 are drawn on the write-up page, so their text follows the site's copy rules.
describe('diagrams shown on the site', () => {
  const shown = ['c1-system-context.puml', 'c2-containers.puml', '_common.puml'].map((f) => read(`docs/architecture/${f}`)).join('\n');
  it('use no em dashes and no hiring language', () => {
    expect(shown).not.toContain('—');
    expect(shown).not.toMatch(/hiring|recruit/i);
  });
  it('describe the site as it is: no contact messages, every page type listed', () => {
    expect(shown).not.toMatch(/contact message/i);
    expect(read('docs/architecture/c1-system-context.puml')).toMatch(/case studies.*privacy notice/);
  });
});
