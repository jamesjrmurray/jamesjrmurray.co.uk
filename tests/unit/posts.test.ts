import { describe, it, expect } from 'vitest';
import { isValidPost, latestPosts } from '../../src/lib/posts';
import type { Post } from '../../src/content/types';

const post = (over: Partial<Post> = {}): Post => ({
  type: 'article', title: 'A title', summary: 'A summary', date: '2025-11-25',
  url: 'https://www.linkedin.com/posts/example', ...over,
});

describe('isValidPost', () => {
  it('accepts a complete post', () => expect(isValidPost(post())).toBe(true));
  it('rejects an empty title', () => expect(isValidPost(post({ title: '  ' }))).toBe(false));
  it('rejects a non-https url', () => expect(isValidPost(post({ url: 'http://x.com' }))).toBe(false));
  it('rejects a malformed date', () => expect(isValidPost(post({ date: '25/11/2025' }))).toBe(false));
  it('rejects an unknown type', () => expect(isValidPost(post({ type: 'podcast' as Post['type'] }))).toBe(false));
  it('rejects an impossible date', () => expect(isValidPost(post({ date: '2025-02-31' }))).toBe(false));
});

describe('latestPosts', () => {
  it('returns newest first and at most 3 by default', () => {
    const result = latestPosts([
      post({ title: 'oldest', date: '2025-01-01' }),
      post({ title: 'newest', date: '2025-12-10' }),
      post({ title: 'middle', date: '2025-11-25' }),
      post({ title: 'second', date: '2025-12-01' }),
    ]);
    expect(result.map((p) => p.title)).toEqual(['newest', 'second', 'middle']);
  });
  it('drops invalid posts before limiting', () => {
    const result = latestPosts([post({ title: 'ok' }), post({ title: '', date: '2026-01-01' })]);
    expect(result.map((p) => p.title)).toEqual(['ok']);
  });
  it('returns an empty list for no posts', () => expect(latestPosts([])).toEqual([]));
  it('does not mutate the input', () => {
    const input = [post({ date: '2025-01-01' }), post({ date: '2025-12-01' })];
    latestPosts(input);
    expect(input[0].date).toBe('2025-01-01');
  });
});
