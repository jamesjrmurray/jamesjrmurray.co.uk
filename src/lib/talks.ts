import type { Talk } from '../content/types';
import { isRealDate } from './posts';

export function isValidTalk(t: Talk): boolean {
  return (
    t.event.trim().length > 0 &&
    t.title.trim().length > 0 &&
    t.quote.trim().length > 0 &&
    t.url.startsWith('https://') &&
    t.image.startsWith('/talks/') &&
    t.imageAlt.trim().length > 0 &&
    isRealDate(t.date)
  );
}

export function latestTalks(talks: Talk[], limit = 3): Talk[] {
  return talks
    .filter(isValidTalk)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
