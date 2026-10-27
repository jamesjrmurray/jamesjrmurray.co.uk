# jamesjrmurray.co.uk

The source for [jamesjrmurray.co.uk](https://jamesjrmurray.co.uk), my personal site. I built it with
[Claude Code](https://claude.com/claude-code): I set the direction and made the calls;
Claude Code built, tested and reviewed it. The story is on the site:
[How I built this website with AI](https://jamesjrmurray.co.uk/work/this-website/).

This is a published copy of a private working repo. Account and resource IDs are replaced with
`<labels>`, and my notes and drafts are left out.

## Stack

- **Site:** [Astro](https://astro.build) (static HTML), Tailwind CSS, TypeScript.
- **Hosting:** AWS S3 + CloudFront, with dev, staging and live environments, all defined in
  CloudFormation (`infra/`).
- **Delivery:** GitHub Actions. CI on every push; deploys use short-lived OIDC credentials, with a
  separate role for the live site. Releases to live are manual and confirmed.
- **Security:** strict content security policy, CloudTrail, GuardDuty, IAM Access Analyzer, account-wide
  S3 Block Public Access, SPF/DMARC/null MX and CAA records (`infra/account-security.yml`,
  `infra/dns-security.yml`).
- **Analytics:** Google Analytics 4 with Consent Mode, only after cookie consent.
- **Tests:** Vitest unit tests and Playwright end-to-end tests in Chromium, Firefox, WebKit and iPhone
  Safari, plus a copy checker that fails the build on banned wording or inline scripts.

## Architecture

C4 diagrams as code with the official AWS icons: [docs/architecture](docs/architecture/README.md).

## Run it

```bash
npm ci
npx astro dev          # http://localhost:4321
npm run verify         # types, unit tests, build, copy check
npm run test:e2e       # browser tests
```

## Licence

Code: MIT. Words, photos and images: © James Murray, all rights reserved. See [LICENSE](LICENSE).
