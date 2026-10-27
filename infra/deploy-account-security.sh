#!/usr/bin/env bash
# Usage: infra/deploy-account-security.sh
# Account-wide security settings. Safe to re-run.
set -euo pipefail
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

# No bucket in this account can ever be made public (CloudFormation has no resource for this).
aws s3control put-public-access-block --account-id "$ACCOUNT" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws cloudformation deploy \
  --region us-east-1 \
  --stack-name jm-account-security \
  --template-file "$(dirname "$0")/account-security.yml" \
  --no-fail-on-empty-changeset
aws cloudformation describe-stacks --region us-east-1 --stack-name jm-account-security \
  --query 'Stacks[0].Outputs' --output table
