import type { Post } from '../content/types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isRealDate(iso: string): boolean {
  if (!ISO_DATE.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

export function isValidPost(p: Post): boolean {
  return (
    (p.type === 'article' || p.type === 'talk') &&
    p.title.trim().length > 0 &&
    p.summary.trim().length > 0 &&
    p.url.startsWith('https://') &&
    isRealDate(p.date)
  );
}

export function latestPosts(posts: Post[], limit = 3): Post[] {
  return posts
    .filter(isValidPost)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
