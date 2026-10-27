#!/usr/bin/env bash
# Usage: [PREVIEW_LOGIN=off] infra/deploy-stack.sh <dev|stage|prod> [acm-certificate-arn] [route53-hosted-zone-id] [alarm-email]
set -euo pipefail
ENV="${1:?env required: dev|stage|prod}"
CERT="${2:-}"
ZONE="${3:-}"
EMAIL="${4:-}"
DOMAINS=""
if [[ -n "$CERT" ]]; then
  case "$ENV" in
    prod)  DOMAINS="jamesjrmurray.co.uk,www.jamesjrmurray.co.uk" ;;
    dev)   DOMAINS="dev.jamesjrmurray.co.uk" ;;
    stage) DOMAINS="staging.jamesjrmurray.co.uk" ;;
  esac
fi
# dev/stage sit behind a browser password prompt; the username:password lives in SSM, never in the repo.
# PREVIEW_LOGIN=off leaves dev/stage open (no password); robots.txt and a noindex header still block crawlers.
FUNCTION_CODE="$(cat "$(dirname "$0")/viewer-request.js")"
if [[ -n "$DOMAINS" ]]; then
  OLD="var CANONICAL_HOST = '';"
  NEW="var CANONICAL_HOST = '${DOMAINS%%,*}';"
  FUNCTION_CODE="${FUNCTION_CODE/"$OLD"/$NEW}"
  [[ "$FUNCTION_CODE" == *"$NEW"* ]] || { echo "deploy-stack: failed to inject canonical host" >&2; exit 1; }
fi
if [[ "$ENV" != "prod" && "${PREVIEW_LOGIN:-on}" != "off" ]]; then
  CREDS=$(aws ssm get-parameter --region us-east-1 --name /jm-site/preview-auth --with-decryption --query Parameter.Value --output text)
  AUTH="Basic $(printf '%s' "$CREDS" | base64)"
  OLD="var AUTH = '';"
  NEW="var AUTH = '$AUTH';"
  FUNCTION_CODE="${FUNCTION_CODE/"$OLD"/$NEW}"
  [[ "$FUNCTION_CODE" == *"$NEW"* ]] || { echo "deploy-stack: failed to inject preview password" >&2; exit 1; }
fi
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name "jm-site-${ENV}" \
  --template-file "$(dirname "$0")/site.yml" \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    EnvName="$ENV" \
    CertificateArn="$CERT" \
    DomainNames="$DOMAINS" \
    HostedZoneId="$ZONE" \
    AlarmEmail="$EMAIL" \
    FunctionCode="$FUNCTION_CODE"
aws cloudformation describe-stacks --region us-east-1 --stack-name "jm-site-${ENV}" \
  --query 'Stacks[0].Outputs' --output table
