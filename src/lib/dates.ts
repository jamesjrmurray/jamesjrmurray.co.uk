// Date labels for talks and posts: "Sep 2025", "25 Nov 2025". Fixed month names, not the runtime's
// en-GB locale data, which says "Sept" and can change between Node versions. Dates are ISO yyyy-mm-dd.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(iso: string): [number, string, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [d, MONTHS[m - 1], y];
}

export const monthYear = (iso: string): string => { const [, m, y] = parts(iso); return `${m} ${y}`; };
export const dayMonthYear = (iso: string): string => { const [d, m, y] = parts(iso); return `${d} ${m} ${y}`; };
