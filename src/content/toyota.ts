import type { CaseStudy } from './types';

export const toyota: CaseStudy = {
  slug: 'toyota',
  title: 'Building the data foundations for AI in connected vehicles',
  org: 'Toyota Connected Europe',
  role: 'Senior Product Owner (Data)',
  years: '2021–2026',
  description: 'Three data decisions that took two AI products from concept to production at Toyota Connected Europe.',
  teaser:
    "The business wanted AI products. The data wasn’t ready. Three decisions (lakehouse first, privacy by design, governance before models) took two AI products from concept to production.",
  highlights: [
    { value: '500B+', label: 'events processed' },
    { value: 'Petabyte-scale', label: 'lakehouse' },
    { value: '2', label: 'AI products in production' },
  ],
  sections: [
    {
      heading: 'The problem',
      paragraphs: [
        "Connected vehicles across Europe generate a vast, constant stream of events. The business wanted AI products built on that data, but the data wasn’t ready for them. It was fragmented, inconsistently governed and slow to turn into anything a model could use.",
      ],
    },
    {
      number: 1, heading: 'Lakehouse before models',
      paragraphs: ['Before any model work, we built a petabyte-scale lakehouse handling more than 500 billion events, with real-time analytics.'],
      tradeOff: 'slower visible progress early on, in exchange for a foundation every AI product could reuse.',
    },
    {
      number: 2, heading: 'Privacy by design',
      paragraphs: ['We collected only the data tied to a defined use, and brought in the privacy team and the DPO from day one, working to UK and EU GDPR and the Data Protection Act 2018.'],
      tradeOff: 'less data, in exchange for trust and faster approvals.',
    },
    {
      number: 3, heading: 'Enrichment and governance before AI',
      paragraphs: ['We enriched raw vehicle data with metadata and customer context, and put AI governance frameworks in place so models could pass review. Streamlining that governance also cut cost-to-serve.'],
      tradeOff: 'governance overhead, in exchange for a clear route to production.',
    },
    {
      heading: 'The outcome',
      paragraphs: ['Two AI products now run in production across the EU, on a platform built to carry the next ones.'],
    },
  ],
  ndaNote: 'This is the short version. The story behind it is better over a coffee or a call, so get in touch.',
  lesson: 'Get your data right. It takes more time and effort than you think. I found that out the hard way.',
};
