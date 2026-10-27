// Banned copy for any built file. Spec §6/§10 and CLAUDE.md ground rules.
// Availability words are banned outright (spec: no "available", "open to", "seeking").
export const RULES = [
  { id: 'availability', re: /\b(available|open\s+to|opentowork|seeking|job[- ]hunting|looking\s+for\s+(my\s+next|a\s+new|new)\s+(role|opportunit\w*|challenge))\b/i },
  { id: 'phone', re: /(\+44\s?(\(0\)\s?)?7\d{3}|\b07\d{3})[\s-]?\d{3}[\s-]?\d{3}\b/ },
  { id: 'email', re: /owner@example\.com/i },
  { id: 'placeholder', re: /\[(?:[A-Z][A-Z ]{2,}|TBC|TODO)\]/ },
  // Curly apostrophes (’) throughout; Astro escapes a straight one to &#39;.
  { id: 'straight-apostrophe', re: /[A-Za-z](?:'|&#39;|&#x27;)[A-Za-z]/ },
  { id: 'annual-claim', re: /£500K\+?[^.<]{0,40}\b(annual\w*|a\s+year|per\s+year)\b|\bannual\w*[^.<]{0,40}£500K/i },
];

// Match raw text (catches meta attributes) and tag-stripped text (catches phrases split by inline tags).
export function findViolations(text) {
  const stripped = text.replace(/<[^>]*>/g, '');
  return RULES.flatMap((r) => {
    const m = text.match(r.re) ?? stripped.match(r.re);
    return m ? [{ rule: r.id, match: m[0] }] : [];
  });
}
