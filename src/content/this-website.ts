import type { CaseStudy } from './types';
import { projects, TESTS_CLAIM } from './site';

export interface Diagram { src: string; srcset: string; alt: string; width: number; height: number }

// The write-up behind the first project card. Lessons are James’s own points (26 Oct 2026), tidied.
export const thisWebsite: CaseStudy & { lessons: string[]; diagrams: Diagram[] } = {
  slug: 'this-website',
  title: projects[0].title,
  org: 'Personal project',
  role: 'Product lead, with Claude Code',
  years: '2026',
  teaser: projects[0].outcome,
  description: 'How I built a secure, tested website on AWS with Claude Code, in less than a working day of my time.',
  highlights: [
    { value: '<1 day', label: 'of my time, brief to live' },
    { value: TESTS_CLAIM, label: 'automated tests' },
    { value: '3', label: 'environments: dev, staging, live' },
  ],
  sections: [
    {
      heading: 'The brief',
      paragraphs: [
        'I wanted a site anyone could understand in under a minute, and trust. It had to show how I think about product, data and AI, without anything confidential and without looking like a template.',
        "I also wanted to do something I talk about a lot: use AI for real product work, not demos. So I built it with Claude Code, an AI coding assistant, working alongside me.",
      ],
    },
    {
      heading: 'How we worked',
      paragraphs: [
        'I was the product lead. I wrote the brief, chose the audience and positioning, and made every trade-off. Claude Code researched peer sites, proposed options, wrote the plans, built the site, wrote the tests and reviewed its own work.',
        'Nothing went live without me. Every change went to a dev site first, every line of copy was mine to approve, and each release to the live site needed my sign-off.',
        'Plans and tests did the heavy lifting. Each feature started as a short design I approved, then a plan, then failing tests, then code. When something broke, the tests caught it before a visitor did.',
      ],
    },
    {
      heading: 'Key decisions',
      paragraphs: [
        'Static over a CMS. Astro builds plain HTML, so the site is fast, cheap to run and hard to attack.',
        'AWS with three environments. S3 and CloudFront host dev, staging and live, all defined as code in CloudFormation, so any of them can be rebuilt from scratch.',
        "No stored keys. GitHub Actions deploys with short-lived credentials (OIDC), and the live site has its own deploy role that dev can’t touch.",
        'Analytics only with consent. Google Analytics runs only if you accept, and then every click is measured, so I can see what people find useful.',
      ],
    },
    {
      heading: 'Security',
      paragraphs: [
        'Before adding more features, I asked for a security review of the site and the AWS account behind it. It found no holes in the site itself, and a handful of things worth tightening around it.',
        'We fixed them: a strict content security policy, a live-only deploy role, an activity log (CloudTrail), threat detection (GuardDuty), email records that stop anyone spoofing my domain, and pinned versions for every third-party build step.',
      ],
    },
    {
      heading: 'Architecture',
      paragraphs: [
        'The diagrams follow the C4 model, drawn as code with the official AWS icons. These two show the big picture; the full set, from system context down to code, lives in the GitHub repo.',
      ],
    },
  ],
  ndaNote: "The site’s code is public on GitHub, with private details removed. The diagrams hide account IDs; everything else is as built.",
  lesson: '',
  lessons: [
    'Discovery and design pay for themselves. The time I spent on the brief, the research and the design is what made the build fast, because the AI never had to guess what I wanted.',
    'Context is everything. The more the AI knew about the audience, the decisions and the ground rules, the better its work. So I kept that context up to date as things changed, not just at the start.',
    "Research isn’t a one-off. Each new section started by going back to what the best sites in my field do, then updating the plan before anyone wrote code.",
  ],
  diagrams: [
    { src: '/architecture/c1-system-context-1600.webp', srcset: '/architecture/c1-system-context-640.webp 640w, /architecture/c1-system-context-1000.webp 1000w, /architecture/c1-system-context-1600.webp 1600w', alt: 'C1 · System context: visitors, search and AI crawlers and me around the site, with GitHub, AWS, Google Analytics and LinkedIn', width: 1600, height: 1609 },
    { src: '/architecture/c2-containers-1600.webp', srcset: '/architecture/c2-containers-640.webp 640w, /architecture/c2-containers-1000.webp 1000w, /architecture/c2-containers-1600.webp 1600w', alt: 'C2 · Containers: the AWS setup behind the site, from DNS and CloudFront to the private S3 bucket, monitoring and security services', width: 1600, height: 1099 },
  ],
};
