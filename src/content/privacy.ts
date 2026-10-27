// Privacy notice copy. Facts checked 2026-10-26 (wording revised 2026-10-27): GA4 loads only after Accept, Google Signals off,
// GA data retention 14 months, no CloudFront access logs, no forms, consent stored in localStorage.
export const privacy = {
  title: 'Privacy notice',
  updated: '27 Oct 2026',
  intro: "This is my personal website, so I collect as little as possible. Here’s exactly what happens to your data.",
  sections: [
    {
      heading: 'Analytics, only if you accept',
      paragraphs: [
        'If you accept analytics, Google Analytics 4 records the pages you visit, the links and buttons you click, how far you scroll, your device and browser type, and your approximate location (town or city). Google Analytics 4 does not store IP addresses.',
        "If you reject analytics, or don’t choose, nothing is sent to Google.",
        'I use this only to see which pages are useful. Detailed analytics data is deleted after 14 months.',
      ],
    },
    {
      heading: 'Cookies and storage',
      paragraphs: [
        'After you accept, Google Analytics sets two cookies, _ga and _ga_<ID>, to tell visits apart. They last up to two years unless you clear them. Choosing Reject later deletes them.',
        'Your choice itself is saved in your browser (as jm-consent-v1), so the banner doesn’t ask again. It never leaves your device.',
      ],
    },
    {
      heading: 'Who handles your data',
      paragraphs: [
        'Me, and Google as the analytics provider. Google may process analytics data in the United States under the EU–US Data Privacy Framework and its UK Extension.',
        "The site is hosted on Amazon Web Services. Like any web server, it uses your IP address to deliver pages, but I don’t keep access logs.",
        "There are no forms, accounts or adverts on this site, and I never sell your data or share it with anyone else.",
      ],
    },
    {
      heading: 'Your choices and rights',
      paragraphs: [
        'You can change your mind at any time with Cookie settings at the bottom of every page.',
        "Analytics data isn’t linked to your name, so I usually can’t pick you out in it, but I’ll help with any request about your data. Message me on LinkedIn.",
        "If you’re unhappy with how I handle your data, you can complain to the Information Commissioner’s Office at ico.org.uk.",
      ],
    },
  ],
};
