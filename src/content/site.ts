import type { Post, Project, Role, Stat, Talk, WorkItem } from './types';

export const github = 'https://github.com/jamesjrmurray';

// Years of experience count from the first engineering role, so the number moves on by itself each year.
export const CAREER_START = 2005;
export const yearsExperience = String(new Date().getFullYear() - CAREER_START);
// Shown on the project card and the write-up; scripts/check-test-count.mjs fails if it stops being true.
// It must hold in the public repo too, which leaves out the private-only tests (273 there on 2026-10-27).
export const TESTS_CLAIM = '270+';

export const hero = {
  eyebrow: 'Product leader for AI and data',
  titleLine1: "Engineer’s instinct.",
  titleLine2: "Product thinker’s questions.",
  summary:
    "I lead product for data platforms and AI. I started as a systems engineer, so I know how the technology underneath works. I’ve also learned that the problems worth solving start with people.",
  employers: ['Holiday Extras', 'Toyota Connected Europe', 'RS Components', 'Direct Line Group'],
};

// Logo row under the hero (files and credits in public/logos/). Alt text = company name.
// `compact` marks badge-shaped logos, drawn a little taller so all four carry similar visual weight.
export const employerLogos = [
  { name: 'Holiday Extras', src: '/logos/holiday-extras.webp', width: 180, height: 115, compact: true },
  { name: 'Toyota Connected Europe', src: '/logos/toyota-connected.svg', width: 170, height: 56, compact: false },
  { name: 'RS Components', src: '/logos/rs-components.svg', width: 293, height: 242, compact: true },
  { name: 'Direct Line Group', src: '/logos/direct-line-group.svg', width: 181, height: 62, compact: false },
];

export const stats: Stat[] = [
  { value: yearsExperience, label: 'years in product and engineering' },
  { value: '500B+', label: 'events on one data platform' },
  { value: '2', label: 'AI products shipped to production' },
  { value: '£500K+', label: 'revenue from one A/B test' },
];

export const work: WorkItem[] = [
  {
    org: 'RS Components', years: '2020–2021', title: 'Global checkout, 31 markets',
    outcome: 'We rebuilt checkout, cutting drop-off by 4.7% and making payments PSD2-compliant.',
  },
  {
    org: 'Verv', years: '2019–2020', title: 'Predictive maintenance with IoT and ML',
    outcome: 'We built a smart plug adapter that predicts tumble dryer faults before they happen, supported by Innovate UK grants.',
    aside: 'I also worked on blockchain energy trading, a joint venture with British Gas also supported by Innovate UK, and was a founding contributor to Energy Web.',
  },
  {
    org: 'Direct Line Group', years: '2017–2019', title: 'One test, £500K+',
    outcome: 'A/B testing the payment flow lifted conversion by around 3%, worth more than £500K in revenue.',
  },
];

// Newest-first ordering is automatic. Add an item per LinkedIn post or talk; see README.md.
// Launch content: the data-readiness article, once James supplies its LinkedIn URL and date.
export const posts: Post[] = [];

export const projects: Project[] = [
  {
    label: 'Project · 2026',
    title: 'How I built this website with AI',
    outcome: 'From brief to a secure, tested site on AWS in less than a working day of my time. I set the direction and made the calls; Claude Code built, tested and reviewed it.',
    tags: ['Astro', 'AWS', 'Infrastructure as code', `${TESTS_CLAIM} tests`],
    pageUrl: '/work/this-website/',
    codeUrl: 'https://github.com/jamesjrmurray/jamesjrmurray.co.uk',
    image: { src: '/architecture/c2-containers-1000.webp', srcset: '/architecture/c2-containers-640.webp 640w, /architecture/c2-containers-1000.webp 1000w', alt: 'C2 container diagram of the AWS setup behind this site', width: 1000, height: 687 },
  },
];

// Talks, newest first automatically. Quotes are James’s own words from each LinkedIn post.
export const talks: Talk[] = [
  {
    event: 'ProductTank Cardiff · Airia, London',
    date: '2025-12-02',
    dateLabel: 'Nov–Dec 2025',
    events: [
      { name: 'ProductTank Cardiff #51', date: '2025-11-25', url: 'https://www.linkedin.com/posts/jamesjrmurray_looking-forward-to-speaking-in-cardiff-tonight-activity-7399091303550144512-ZVWC' },
      { name: 'Airia, London', date: '2025-12-02', url: 'https://www.linkedin.com/posts/jamesjrmurray_from-prototype-to-production-agentic-ai-activity-7401319830496161792-ptPX' },
    ],
    title: 'Is your data ready for an AI product or feature?',
    quote: 'A question rising to the top of every organisation’s agenda.',
    url: 'https://www.linkedin.com/posts/jamesjrmurray_looking-forward-to-speaking-in-cardiff-tonight-activity-7399091303550144512-ZVWC',
    image: '/talks/producttank-cardiff-51.webp', imageSrcset: '/talks/producttank-cardiff-51-640.webp 640w, /talks/producttank-cardiff-51.webp 960w', imageWidth: 960, imageHeight: 533,
    imageAlt: 'ProductTank Cardiff #51 event poster, 25 November 2025, with speakers James Murray and Morgan Patzelt',
  },
  {
    event: 'Data Decoded',
    date: '2025-10-21',
    title: 'Pilot, Pivot, Perform: Building a Data Lakehouse in the IoT World',
    quote: 'Aligning architecture with real business needs, not just technology, helps turn IoT data into meaningful outcomes.',
    url: 'https://www.linkedin.com/posts/jamesjrmurray_really-enjoyed-sharing-the-journey-in-pilot-activity-7386782660213235712-NvM8',
    image: '/talks/data-decoded-2025.webp', imageSrcset: '/talks/data-decoded-2025-640.webp 640w, /talks/data-decoded-2025.webp 960w', imageWidth: 960, imageHeight: 720,
    imageAlt: 'James Murray on stage at Data Decoded, presenting a slide about the bronze layer of a data lakehouse',
    imagePosition: '70% 40%',
  },
];

export const about = {
  headingLead: 'People first,',
  headingAccent: 'systems second.',
  paragraphs: [
    "I’ve worked on both sides: the technology and the business. Engineering taught me what’s possible. Product thinking changes the question: not just “how do we build this?” but “should we?” and “will it hold up for the people who depend on it?”",
    "Today I’m Area Product Owner at Holiday Extras, leading a team of product owners across one area of the business. Before that, I spent five years turning connected-vehicle data into AI products at Toyota Connected Europe.",
    'Outside work: parish councillor in Lenham, Kent; committee member of the Lenham Meadows Trust; charity fundraiser for Demelza Hospice Care for Children; sports fanatic; and wine taster with ambitions to become a connoisseur.',
  ],
};

export const career: { roles: Role[]; engineering: Role } = {
  roles: [
    { dates: '2026–now', title: 'Area Product Owner', org: 'Holiday Extras', note: 'Leading a product area and its product owners' },
    { dates: '2021–2026', title: 'Senior Product Owner (Data)', org: 'Toyota Connected Europe', note: 'Petabyte-scale data platform; two AI products to production' },
    { dates: '2020–2021', title: 'E-commerce Product Owner', org: 'RS Components', note: 'Checkout across 31 markets; PSD2 payments' },
    { dates: '2019–2020', title: 'Senior Product Manager', org: 'Verv', note: 'IoT and ML predictive maintenance; blockchain energy trading' },
    { dates: '2017–2019', title: 'Senior Digital Product Manager (E-commerce)', org: 'Direct Line Group', note: 'Payment A/B testing; home insurance strategy' },
    { dates: '2016–2017', title: 'Product Owner (API)', org: 'RDT', note: 'E-commerce API for an Australian insurer' },
    { dates: '2015–2016', title: 'Product Manager', org: 'Appnovation', note: 'Portal and API products' },
    { dates: '2011–2015', title: 'Product Manager', org: 'Cogeco Peer 1', note: '$30M+ global cloud portfolio; engineering to product' },
  ],
  engineering: { dates: `${CAREER_START}–2011`, title: 'Systems Engineer', org: 'Liquid Knowledge, Wavex', note: '' },
};

export const contact = {
  headingLead: 'Always happy to talk AI, data and',
  headingAccent: 'product leadership.',
  linkedin: 'https://www.linkedin.com/in/jamesjrmurray',
  github,
  cvPath: '/James-Murray-CV.pdf',
};
