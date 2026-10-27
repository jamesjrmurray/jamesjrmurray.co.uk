import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const src = readFileSync('infra/viewer-request.js', 'utf8');
// CloudFront functions are plain scripts; evaluate and pull out `handler`.
const load = (code: string) => new Function('require', `${code}; return handler;`)(createRequire(import.meta.url)) as (e: unknown) => any;
const handler = load(src);

const ev = (uri: string, host = 'jamesjrmurray.co.uk', querystring: Record<string, { value: string }> = {}, auth?: string) => ({
  request: {
    uri,
    querystring,
    headers: { host: { value: host }, ...(auth ? { authorization: { value: auth } } : {}) },
  },
});

describe('viewer-request', () => {
  it('serves index.html for the root', () => expect(handler(ev('/')).uri).toBe('/index.html'));
  it('serves index.html for a trailing-slash path', () => expect(handler(ev('/work/toyota/')).uri).toBe('/work/toyota/index.html'));
  it('serves index.html for an extensionless path', () => expect(handler(ev('/work/toyota')).uri).toBe('/work/toyota/index.html'));
  it('leaves files with extensions alone', () => {
    expect(handler(ev('/og.png')).uri).toBe('/og.png');
    expect(handler(ev('/_astro/index.abc123.css')).uri).toBe('/_astro/index.abc123.css');
    expect(handler(ev('/robots.txt')).uri).toBe('/robots.txt');
  });
  it('redirects www to apex with a 301, keeping path and query', () => {
    const res = handler(ev('/work/toyota/', 'www.jamesjrmurray.co.uk', { utm_source: { value: 'li' } }));
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe('https://jamesjrmurray.co.uk/work/toyota/?utm_source=li');
  });
  it('does not redirect cloudfront.net hosts', () => {
    expect(handler(ev('/', 'd111111abcdef8.cloudfront.net')).uri).toBe('/index.html');
  });
});

describe('viewer-request password prompt', () => {
  const expected = 'Basic ' + Buffer.from('preview:secret').toString('base64');
  const guarded = load(src.replace("var AUTH = '';", `var AUTH = '${expected}';`));

  it('is off in the committed source', () => expect(src).toContain("var AUTH = '';"));
  it('asks for a password when none is sent', () => {
    const res = guarded(ev('/', 'dev.jamesjrmurray.co.uk'));
    expect(res.statusCode).toBe(401);
    expect(res.headers['www-authenticate'].value).toContain('Basic');
  });
  it('rejects a wrong password', () => {
    const wrong = 'Basic ' + Buffer.from('preview:nope').toString('base64');
    expect(guarded(ev('/', 'dev.jamesjrmurray.co.uk', {}, wrong)).statusCode).toBe(401);
  });
  it('serves the page with the right password', () => {
    expect(guarded(ev('/work/toyota', 'dev.jamesjrmurray.co.uk', {}, expected)).uri).toBe('/work/toyota/index.html');
  });
});

describe('viewer-request with a canonical host', () => {
  const canon = load(src.replace("var CANONICAL_HOST = '';", "var CANONICAL_HOST = 'jamesjrmurray.co.uk';"));
  it('redirects the raw cloudfront.net address to the canonical host', () => {
    const res = canon(ev('/work/toyota/', 'd2h7uqu1g5vtwq.cloudfront.net', { a: { value: '1' } }));
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe('https://jamesjrmurray.co.uk/work/toyota/?a=1');
  });
  it('redirects www to the canonical host', () => {
    expect(canon(ev('/', 'www.jamesjrmurray.co.uk')).headers.location.value).toBe('https://jamesjrmurray.co.uk/');
  });
  it('serves the canonical host normally', () => expect(canon(ev('/')).uri).toBe('/index.html'));
});

describe('viewer-request and the 404 page', () => {
  // CloudFront serves /404.html as the body of every 404. Asked for directly, it must not answer 200.
  it('treats a direct request for /404.html as missing', () => expect(handler(ev('/404.html')).uri).not.toBe('/404.html'));
});
