#!/usr/bin/env bash
# Usage: SITE_URL=https://… SITE_ENV=dev [PREVIEW_AUTH=user:pass] [EXPECT_VERSION=<git sha>] [EXPECT_GA_ID=G-…] scripts/smoke.sh
set -euo pipefail
: "${SITE_URL:?}"; : "${SITE_ENV:?}"
fail=0
check() { # name expected actual
  if [[ "$3" == *"$2"* ]]; then echo "ok   $1"; else echo "FAIL $1: expected '$2', got '${3:0:120}'"; fail=1; fi
}
curl() { if [[ -n "${PREVIEW_AUTH:-}" ]]; then command curl -u "$PREVIEW_AUTH" "$@"; else command curl "$@"; fi; }
status() { curl -s -o /dev/null -w '%{http_code}' "$1"; }

if [[ "$SITE_ENV" != "prod" ]]; then
  # 401 = password prompt.
  anon=$(command curl -s -o /dev/null -w '%{http_code}' "$SITE_URL/")
  # 200 = preview left open on purpose (PREVIEW_LOGIN=off); then crawlers must still be told to stay out.
  if [[ "$anon" == 401 ]]; then echo "ok   non-prod blocks anonymous visitors"
  elif [[ "$anon" == 200 && "$(curl -s "$SITE_URL/robots.txt")" == *"Disallow: /"* ]]; then echo "ok   non-prod is open but blocks crawlers"
  else echo "FAIL non-prod blocks anonymous visitors or crawlers: got '$anon'"; fail=1; fi
fi

# The release that passed CI is the one being served (deploy-env.yml writes version.txt).
if [[ -n "${EXPECT_VERSION:-}" ]]; then check "live version is $EXPECT_VERSION" "$EXPECT_VERSION" "$(curl -s "$SITE_URL/version.txt")"; fi

check "home 200"               200 "$(status "$SITE_URL/")"
check "case study no slash"    200 "$(status "$SITE_URL/work/toyota")"
check "case study slash"       200 "$(status "$SITE_URL/work/toyota/")"
check "missing page 404"       404 "$(status "$SITE_URL/definitely-not-here")"
check "404 is branded"         "Page not found" "$(curl -s "$SITE_URL/definitely-not-here")"
robots_header=$(curl -sI "$SITE_URL/" | tr -d '\r' | grep -i '^x-robots-tag:' || true)
if [[ "$SITE_ENV" == "prod" ]]; then
  if [[ -z "$robots_header" ]]; then echo "ok   prod indexable header"; else echo "FAIL prod indexable header: got '$robots_header'"; fail=1; fi
  check "prod robots allow" "Allow: /" "$(curl -s "$SITE_URL/robots.txt")"
else
  check "non-prod noindex header" "noindex" "$robots_header"
  check "non-prod robots disallow" "Disallow: /" "$(curl -s "$SITE_URL/robots.txt")"
fi

# Every page and file a visitor or crawler asks for by name.
for p in /privacy/ /work/this-website/ /llms.txt /sitemap-index.xml /favicon.ico /apple-touch-icon.png; do
  check "$p 200" 200 "$(status "$SITE_URL$p")"
done

# Security headers (infra/site.yml), lower-cased so the match ignores header case.
headers=$(curl -sI "$SITE_URL/" | tr -d '\r' | tr '[:upper:]' '[:lower:]')
for h in "content-security-policy: default-src 'self'" "form-action 'none'" "frame-ancestors 'none'" \
  "strict-transport-security: max-age=63072000" "x-content-type-options: nosniff" "x-frame-options: deny" \
  "referrer-policy: strict-origin-when-cross-origin" "permissions-policy: camera=()" "cross-origin-opener-policy: same-origin"; do
  check "header $h" "$h" "$headers"
done

# Caching: pages are re-checked on every visit, hashed build files kept a year, images a day.
check "pages revalidate" "cache-control: no-cache" "$headers"
asset=$(curl -s "$SITE_URL/" | grep -o '/_astro/[^"]*\.css' | head -1)
check "build files cached a year" "immutable" "$(curl -sI "$SITE_URL$asset" | tr -d '\r' | grep -i '^cache-control:')"
check "images cached a day" "max-age=86400" "$(curl -sI "$SITE_URL/james-murray.webp" | tr -d '\r' | grep -i '^cache-control:')"

# The right Google Analytics ID for this environment is in the page (a build without it once reached dev).
if [[ -n "${EXPECT_GA_ID:-}" ]]; then check "analytics ID $EXPECT_GA_ID" "data-ga-id=\"$EXPECT_GA_ID\"" "$(curl -s "$SITE_URL/")"; fi

# Live only: http and www each reach the canonical https address in one hop.
if [[ "$SITE_ENV" == "prod" ]]; then
  host=${SITE_URL#https://}
  check "http redirects to https" "301 https://$host/" "$(command curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://$host/")"
  check "www redirects to the bare domain" "301 https://$host/" "$(command curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://www.$host/")"
fi
exit $fail
